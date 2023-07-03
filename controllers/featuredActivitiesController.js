/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { Op } = require("sequelize");

class FeaturedActivitiesController extends BaseController {
  constructor(model, restaurantModel, reviewModel, makanlistModel, userModel) {
    super(model);
    this.restaurantModel = restaurantModel;
    this.reviewModel = reviewModel;
    this.makanlistModel = makanlistModel;
    this.userModel = userModel;
  }

  getFeaturedFeed = async (req, res) => {
    try {
      // Load featured activities excluding "makanlistrestaurant" type
      const featuredActivities = await this.model.findAll({
        where: {
          targetType: {
            [Op.not]: "makanlistrestaurant",
          },
        },
        order: [
          ["score", "DESC"],
          ["userActivityCount", "DESC"],
          ["updatedAt", "DESC"],
        ],
      });

      // Group activities by target type
      const activitiesByType = featuredActivities.reduce((groups, activity) => {
        const group = groups[activity.targetType] || [];
        group.push(activity);
        groups[activity.targetType] = group;
        return groups;
      }, {});

      // Load related targets for each group
      const loaders = {
        restaurant: this.restaurantModel,
        review: this.reviewModel,
        makanlist: this.makanlistModel,
      };

      // Define the associated loaders for eager loading
      const associatedLoaders = {
        makanlist: {
          include: [
            {
              model: this.userModel,
              attributes: ["id", "email", "username", "photoUrl", "lastLogin"],
            },
            {
              model: this.restaurantModel,
              attributes: [
                "id",
                "name",
                "address",
                "placeId",
                "locationId",
                "description",
                "photoUrl",
                "googleMapsUrl",
                "averageRating",
                "priceRangeId",
                "statusId",
              ],
            },
          ],
        },
        restaurant: {
          include: [
            {
              model: this.makanlistModel,
            },
          ],
        },
        review: {
          include: [
            {
              model: this.userModel,
              attributes: ["id", "email", "username", "photoUrl", "lastLogin"],
            },
            {
              model: this.restaurantModel,
              attributes: [
                "id",
                "name",
                "address",
                "placeId",
                "locationId",
                "description",
                "photoUrl",
                "googleMapsUrl",
                "averageRating",
                "priceRangeId",
                "statusId",
              ],
            },
          ],
        },
      };

      const loadedActivities = [];
      for (const [type, activities] of Object.entries(activitiesByType)) {
        const loader = loaders[type];
        if (!loader) {
          console.log(`No loader for target type ${type}`);
          continue;
        }

        const associatedLoader = associatedLoaders[type];
        const queryOptions = {
          where: {
            id: activities.map((activity) => activity.targetId),
          },
        };

        if (associatedLoader) {
          queryOptions.include = associatedLoader.include;
        }

        const targets = await loader.findAll(queryOptions);

        // Attach targets to activities and only include those where target exists
        for (const activity of activities) {
          const target = targets.find(
            (target) => target.id === activity.targetId
          );
          if (!target) {
            console.log(
              `No target found for ${type} activity with ID ${activity.targetId}`
            );
            continue;
          }
          activity.setDataValue("target", target);
          loadedActivities.push(activity);
        }
      }

      // Sort all loaded activities by score, then userActivityCount, then creation time
      loadedActivities.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (b.userActivityCount !== a.userActivityCount) {
          return b.userActivityCount - a.userActivityCount;
        }
        return b.updatedAt - a.updatedAt;
      });

      // Limit to top 15
      const topActivities = loadedActivities.slice(0, 15);

      return res.json({
        success: true,
        topActivities,
      });
    } catch (err) {
      console.log("Error getting featured feed:", err);
      return res.status(500).json({ success: false, msg: err.message });
    }
  };
}

module.exports = FeaturedActivitiesController;
