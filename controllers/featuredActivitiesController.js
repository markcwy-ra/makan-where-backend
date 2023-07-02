/* eslint-disable no-unused-vars */
const { sequelize } = require("../db/models");
const BaseController = require("./baseController");
const { calculateAndUpdateScore } = require("../utils/scoreUtils");

class FeaturedActivitiesController extends BaseController {
  constructor(
    model,
    restaurantModel,
    reviewModel,
    makanlistModel,
    userActivityModel
  ) {
    super(model);
    this.restaurantModel = restaurantModel;
    this.reviewModel = reviewModel;
    this.makanlistModel = makanlistModel;
    this.userActivityModel = userActivityModel;
  }

  // Get feed
  getFeaturedFeed = async (req, res) => {
    try {
      // Get top restaurant activities
      const featuredRestaurantActivities = await this.model.findAll({
        where: {
          targetType: "restaurant",
        },
        order: [
          ["score", "DESC"],
          ["userActivityCount", "DESC"],
        ],
        limit: 10,
      });

      // Get top makanlist activities
      const featuredMakanlistActivities = await this.model.findAll({
        where: {
          targetType: "makanlist",
        },
        order: [
          ["score", "DESC"],
          ["userActivityCount", "DESC"],
        ],
        limit: 10,
      });

      // Get top review activities
      const featuredReviewActivities = await this.model.findAll({
        where: {
          targetType: "review",
        },
        order: [
          ["score", "DESC"],
          ["userActivityCount", "DESC"],
        ],
        limit: 10,
      });

      // const featuredActivities = await this.model.findAll({
      //   order: [["score", "DESC"]],
      //   limit: 10,
      // });

      // Get target IDs
      // const targetIds = featuredActivities.map((activity) => activity.targetId);

      // Get restaurant IDs
      const featuredRestaurants = await this.restaurantModel.findAll({
        where: {
          id: featuredRestaurantActivities.map((activity) => activity.targetId),
        },
      });

      // Get makanlist IDs
      const featuredMakanlists = await this.makanlistModel.findAll({
        where: {
          id: featuredMakanlistActivities.map((activity) => activity.targetId),
        },
      });

      // Get review IDs
      const featuredReviews = await this.reviewModel.findAll({
        where: {
          id: featuredReviewActivities.map((activity) => activity.targetId),
        },
      });

      return res.json({
        success: true,
        featuredRestaurants,
        featuredMakanlists,
        featuredReviews,
      });
    } catch (err) {
      console.log("Error getting featured feed:", err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  };
}

module.exports = FeaturedActivitiesController;
