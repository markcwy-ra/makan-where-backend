/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { fn, col } = require("sequelize");

class ReviewsController extends BaseController {
  constructor(model, restaurantModel, userModel, userActivityModel) {
    super(model);
    this.restaurantModel = restaurantModel;
    this.userModel = userModel;
    this.userActivityModel = userActivityModel;
  }

  // Get all reviews for restaurant
  getAllReviews = async (req, res) => {
    const { restaurantId } = req.params;

    try {
      const restaurant = await this.restaurantModel.findByPk(restaurantId);
      if (!restaurant) {
        return res
          .status(404)
          .json({ error: true, msg: "Restaurant not found" });
      }

      const reviews = await this.model.findAll({
        where: { restaurantId },
        include: [
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
          },
        ],
      });

      if (!reviews) {
        return res.status(404).json({ error: true, msg: "Reviews not found" });
      }

      return res.json({ reviews });
    } catch (err) {
      console.log("Error fetching reviews:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Count reviews for restaurant
  countAllReviews = async (req, res) => {
    const { restaurantId } = req.params;

    try {
      const count = await this.model.count({ where: { restaurantId } });

      return res.json({ count });
    } catch (err) {
      console.log("Error counting reviews:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Get all reviews by user
  getAllUserReviews = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const reviews = await this.model.findAll({
        where: { userId },
        include: [
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
          },
        ],
      });

      if (!reviews) {
        return res.status(404).json({ error: true, msg: "Reviews not found" });
      }

      return res.json({ reviews });
    } catch (err) {
      console.log("Error fetching reviews:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Count reviews by user
  countAllUserReviews = async (req, res) => {
    const { userId } = req.params;

    try {
      const count = await this.model.count({ where: { userId } });

      return res.json({ count });
    } catch (err) {
      console.log("Error counting reviews:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Get one review by user
  getOneUserReview = async (req, res) => {
    const { userId, placeId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      let restaurant = await this.restaurantModel.findOne({
        where: { placeId },
      });
      if (!restaurant) {
        return res
          .status(404)
          .json({ error: true, msg: "Restaurant not found" });
      }

      const review = await this.model.findOne({
        where: { userId, restaurantId: restaurant.id },
        include: [
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
          },
        ],
      });

      if (!review) {
        return res.status(404).json({ error: true, msg: "Review not found" });
      }

      return res.json(review);
    } catch (err) {
      console.log("Error fetching review:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Add new review for restaurant
  addReview = async (req, res) => {
    const { restaurantId } = req.params;
    const { userId, rating, title, body, photoUrl, recommendedDishes } =
      req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const restaurant = await this.restaurantModel.findByPk(restaurantId);
      if (!restaurant) {
        return res
          .status(404)
          .json({ error: true, msg: "Restaurant not found" });
      }

      const existingReview = await this.model.findOne({
        where: { userId, restaurantId },
      });

      if (existingReview) {
        return res.status(409).json({
          error: true,
          msg: "User has already left a review for this restaurant",
        });
      }

      const newReview = await this.model.create({
        userId,
        restaurantId,
        rating,
        title,
        body,
        photoUrl,
        recommendedDishes,
      });

      // Calculate average rating and update restaurant entry
      const averageRating = await this.calculateAverageRating(restaurantId);
      await this.restaurantModel.update(
        { averageRating: averageRating },
        { where: { id: restaurantId } }
      );

      // Log activity
      try {
        await this.userActivityModel.create({
          userId,
          activityType: "added",
          targetId: newReview.id,
          targetType: "review",
        });
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Eager load user and restaurant data
      const reviewWithDetails = await this.model.findOne({
        where: { id: newReview.id },
        include: [
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
          },
        ],
      });

      return res.status(201).json(reviewWithDetails);
    } catch (err) {
      console.log("Error creating review:", err);
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Update review for restaurant
  updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { userId, rating, title, body, photoUrl, recommendedDishes } =
      req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const existingReview = await this.model.findOne({
        where: { id: reviewId, userId },
      });

      if (!existingReview) {
        return res.status(404).json({ error: true, msg: "Review not found" });
      }

      existingReview.rating = rating;
      existingReview.title = title;
      existingReview.body = body;
      existingReview.photoUrl = photoUrl;
      existingReview.recommendedDishes = recommendedDishes;
      await existingReview.save();

      // Calculate average rating and update restaurant entry
      const averageRating = await this.calculateAverageRating(
        existingReview.restaurantId
      );
      await this.restaurantModel.update(
        { averageRating: averageRating },
        { where: { id: existingReview.restaurantId } }
      );

      // Log activity
      try {
        await this.userActivityModel.create({
          userId,
          activityType: "updated",
          targetId: existingReview.id,
          targetType: "review",
        });
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Get updated review
      const updatedReview = await this.model.findOne({
        where: { id: reviewId },
        include: [
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
          },
        ],
      });

      return res.json(updatedReview);
    } catch (err) {
      console.log("Error updating review:", err);
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Delete review for restaurant
  deleteReview = async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const existingReview = await this.model.findOne({
        where: { id: reviewId, userId },
        include: [
          {
            model: this.userModel,
            as: "upvotedBy",
            through: {
              attributes: [],
            },
          },
        ],
      });

      if (!existingReview) {
        return res.status(404).json({ error: true, msg: "Review not found" });
      }

      // Get restaurantId
      const restaurantId = existingReview.restaurantId;

      // Log activity
      try {
        await this.userActivityModel.create({
          userId,
          activityType: "deleted",
          targetId: existingReview.id,
          targetType: "review",
        });
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Fetch and delete all upvotes associated with review
      await existingReview.removeUpvotedBy(existingReview.upvotedBy);

      // Delete review
      await existingReview.destroy();

      // Calculate and update average rating
      const averageRating = await this.calculateAverageRating(restaurantId);
      const averageRatingToSet = averageRating || 0; // If averageRating is null, set to 0
      await this.restaurantModel.update(
        { averageRating: averageRatingToSet },
        { where: { id: restaurantId } }
      );

      return res.json({ success: true, msg: "Review deleted successfully" });
    } catch (err) {
      console.log("Error deleting review:", err);
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Upvote review
  upvoteReview = async (req, res) => {
    const { reviewId } = req.params;
    const { userId } = req.body; // User upvoting

    try {
      const user = await this.userModel.findByPk(userId);
      const review = await this.model.findByPk(reviewId);

      if (user && review) {
        await user.addUpvotedReviews(review);

        // Log activity
        try {
          await this.userActivityModel.create({
            userId,
            activityType: "upvoted",
            targetId: reviewId,
            targetType: "review",
          });
        } catch (activityError) {
          console.log("Failed to log activity:", activityError);
        }

        return res.json({ success: true, msg: "Successfully upvoted review" });
      } else {
        return res
          .status(404)
          .json({ error: true, msg: "User or review not found" });
      }
    } catch (err) {
      console.log("Error upvoting review:", err);
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Remove review upvote
  removeReviewUpvote = async (req, res) => {
    const { reviewId, userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const review = await this.model.findByPk(reviewId);

      if (user && review) {
        // Log activity
        try {
          await this.userActivityModel.create({
            userId,
            activityType: "removed upvote",
            targetId: reviewId,
            targetType: "review",
          });
        } catch (activityError) {
          console.log("Failed to log activity:", activityError);
        }

        await user.removeUpvotedReviews(review);
        return res.json({
          success: true,
          msg: "Successfully removed review upvote",
        });
      } else {
        return res
          .status(404)
          .json({ error: true, msg: "User or review not found" });
      }
    } catch (err) {
      console.log("Error upvoting review:", err);
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Get all users who upvoted specific review
  getReviewUpvotes = async (req, res) => {
    const { reviewId } = req.params;

    try {
      const review = await this.model.findByPk(reviewId);

      if (review) {
        const upvotes = await review.getUpvotedBy();
        return res.json({ upvotes });
      } else {
        return res.status(404).json({ error: true, msg: "Review not found" });
      }
    } catch (err) {
      console.log("Error getting review upvotes:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Count upvotes for review
  countReviewUpvotes = async (req, res) => {
    const { reviewId } = req.params;

    try {
      const review = await this.model.findByPk(reviewId);

      if (review) {
        const count = await review.countUpvotedBy();
        return res.json({ count });
      } else {
        return res.status(404).json({ error: true, msg: "Review not found" });
      }
    } catch (err) {
      console.log("Error counting review upvotes:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Get all reviews upvoted by specific user
  getUserUpvotedReviews = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const upvotedReviews = await user.getUpvotedReviews();
      return res.json({ upvotedReviews });
    } catch (err) {
      console.log("Error fetching user's upvoted reviews");
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Count all reviews upvoted by specific user
  countUserUpvotedReviews = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const upvotedReviews = await user.getUpvotedReviews();
      const count = upvotedReviews.length;
      return res.json({ count });
    } catch (err) {
      console.log("Error counting user's upvoted reviews");
      return res.status(500).json({ error: true, msg: err });
    }
  };

  // Check if user has upvoted review
  getUserUpvoteStatusForReview = async (req, res) => {
    const { reviewId, userId } = req.params;
    try {
      const user = await this.userModel.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const review = await this.model.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({ error: true, msg: "Review not found" });
      }
      const upvotedReviews = await user.getUpvotedReviews();
      const hasUpvoted = upvotedReviews.some(
        (review) => review.id === Number(reviewId)
      );

      return res.json({
        success: true,
        hasUpvoted,
        user,
        review,
      });
    } catch (err) {
      console.log("Error checking upvote status for review:", err);
      return res.status(500).json({ success: false, msg: err });
    }
  };

  // Calculate average rating of restaurant
  calculateAverageRating = async (restaurantId) => {
    const result = await this.model.findOne({
      attributes: [[fn("AVG", col("rating")), "averageRating"]],
      where: { restaurantId: restaurantId },
      raw: true,
    });

    return result.averageRating ? parseFloat(result.averageRating) : 0;
  };
}

module.exports = ReviewsController;
