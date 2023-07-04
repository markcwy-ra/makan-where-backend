/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { fn, col } = require("sequelize");
const { calculateAndUpdateScore } = require("../utils/scoreUtils");

//------------ IMPORT CONSTANTS ------------//
const {
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  CONFLICT,
  SERVER_ERROR,
} = require("../constants/statusCodes");

const {
  RESTAURANT_NOT_FOUND,
  REVIEWS_NOT_FOUND,
  USER_NOT_FOUND,
  REVIEW_NOT_FOUND,
  REVIEW_UPVOTED_SUCCESS,
  USER_REVIEW_EXISTS,
  REVIEW_DELETED_SUCCESS,
  REVIEW_UPVOTE_REMOVED_SUCCESS,
  USER_OR_REVIEW_NOT_FOUND,
} = require("../constants/messages");
//------------------------------------------//

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
          .status(NOT_FOUND)
          .json({ error: true, msg: RESTAURANT_NOT_FOUND });
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
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEWS_NOT_FOUND });
      }

      return res.json({ reviews });
    } catch (err) {
      console.log("Error fetching reviews:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
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
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
    }
  };

  // Get all reviews by user
  getAllUserReviews = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
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
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEWS_NOT_FOUND });
      }

      return res.json({ reviews });
    } catch (err) {
      console.log("Error fetching reviews:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
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
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
    }
  };

  // Get one review by user
  getOneUserReview = async (req, res) => {
    const { userId, placeId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      let restaurant = await this.restaurantModel.findOne({
        where: { placeId },
      });
      if (!restaurant) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: RESTAURANT_NOT_FOUND });
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
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEW_NOT_FOUND });
      }

      return res.json(review);
    } catch (err) {
      console.log("Error fetching review:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
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
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const restaurant = await this.restaurantModel.findByPk(restaurantId);
      if (!restaurant) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: RESTAURANT_NOT_FOUND });
      }

      const existingReview = await this.model.findOne({
        where: { userId, restaurantId },
      });

      if (existingReview) {
        return res.status(CONFLICT).json({
          error: true,
          msg: USER_REVIEW_EXISTS,
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

      // Calculate score
      await calculateAndUpdateScore(newReview.id, "review");

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

      return res.status(CREATED).json(reviewWithDetails);
    } catch (err) {
      console.log("Error creating review:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
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
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const existingReview = await this.model.findOne({
        where: { id: reviewId, userId },
      });

      if (!existingReview) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEW_NOT_FOUND });
      }

      existingReview.rating = rating;
      existingReview.title = title;
      existingReview.body = body;
      if (photoUrl) {
        existingReview.photoUrl = photoUrl;
      }
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

      // Calculate score
      await calculateAndUpdateScore(existingReview.id, "review");

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
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
    }
  };

  // Delete review for restaurant
  deleteReview = async (req, res) => {
    const { userId, reviewId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
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
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEW_NOT_FOUND });
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

      // Calculate score
      await calculateAndUpdateScore(existingReview.id, "review");

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

      return res.json({ success: true, msg: REVIEW_DELETED_SUCCESS });
    } catch (err) {
      console.log("Error deleting review:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
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

        // Calculate score
        await calculateAndUpdateScore(reviewId, "review");

        return res.json({ success: true, msg: REVIEW_UPVOTED_SUCCESS });
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: USER_OR_REVIEW_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error upvoting review:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
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

        // Calculate score
        await calculateAndUpdateScore(reviewId, "review");

        await user.removeUpvotedReviews(review);
        return res.json({
          success: true,
          msg: REVIEW_UPVOTE_REMOVED_SUCCESS,
        });
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: USER_OR_REVIEW_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error upvoting review:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
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
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEW_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error getting review upvotes:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
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
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEW_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error counting review upvotes:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
    }
  };

  // Get all reviews upvoted by specific user
  getUserUpvotedReviews = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const upvotedReviews = await user.getUpvotedReviews({
        include: [
          {
            model: this.restaurantModel,
          },
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
        ],
      });
      return res.json({ upvotedReviews });
    } catch (err) {
      console.log("Error fetching user's upvoted reviews");
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
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
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
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
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const review = await this.model.findByPk(reviewId);
      if (!review) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: REVIEW_NOT_FOUND });
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
      return res.status(SERVER_ERROR).json({ success: false, msg: err });
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
