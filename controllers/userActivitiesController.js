/* eslint-disable no-unused-vars */
const { sequelize } = require("../db/models");
const BaseController = require("./baseController");
const { Op } = require("sequelize");

class UserActivitiesController extends BaseController {
  constructor(model, userModel, restaurantModel, reviewModel, makanlistModel) {
    super(model);
    this.userModel = userModel;
    this.restaurantModel = restaurantModel;
    this.reviewModel = reviewModel;
    this.makanlistModel = makanlistModel;
  }

  getUserFeed = async (req, res) => {
    const { userId } = req.params;
    let { page, limit } = req.query;

    // Set default values for page and limit
    page = isNaN(page) || page <= 0 ? 1 : parseInt(page); // Default to page 1
    limit = isNaN(limit) || limit <= 0 ? 10 : parseInt(limit); // Limit to 10

    // Calculate offset
    const offset = (page - 1) * limit;

    try {
      // Find user
      const user = await this.userModel.findByPk(userId);

      // Fetch user's follows
      const followingUsers = await user.getFollowingUsers({
        attributes: ["id"],
      });
      const followingUsersIds = followingUsers.map((follow) => follow.id);

      // Get activities of follows
      const userActivities = await this.model.findAll({
        where: { userId: { [Op.in]: followingUsersIds } },
        order: [["createdAt", "DESC"]],
        limit: limit,
        offset: offset,
        include: [
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl", "lastLogin"],
          },
        ],
      });

      if (userActivities.length === 0) {
        return res
          .status(404)
          .json({ error: true, msg: "No user activities found" });
      }

      // Fetch additional data based on activity type
      const userActivitiesWithDetails = await Promise.all(
        userActivities.map(async (userActivity) => {
          let targetDetails = {};

          switch (userActivity.targetType) {
            case "review": {
              const review = await this.reviewModel.findOne({
                where: { id: userActivity.targetId },
                include: [
                  {
                    model: this.userModel,
                    attributes: [
                      "id",
                      "email",
                      "username",
                      "photoUrl",
                      "lastLogin",
                    ],
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
              });

              if (!review) {
                console.log(`No review found with id ${userActivity.targetId}`);
                targetDetails = {
                  error: `This activity refers to a review that no longer exists`,
                };
                break;
              }

              targetDetails = review;
              break;
            }
            case "makanlist": {
              const makanlist = await this.makanlistModel.findOne({
                where: { id: userActivity.targetId },
                include: [
                  {
                    model: this.userModel,
                    attributes: [
                      "id",
                      "email",
                      "username",
                      "photoUrl",
                      "lastLogin",
                    ],
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
              });

              if (!makanlist) {
                console.log(
                  `No makanlist found with id ${userActivity.targetId}`
                );
                targetDetails = {
                  error: `This activity refers to a makanlist that no longer exists`,
                };
                break;
              }

              targetDetails = makanlist;
              break;
            }
            case "makanlistrestaurant": {
              const makanlistRestaurant =
                await sequelize.models.makanlist_restaurants.findOne({
                  where: { id: userActivity.targetId },
                  attributes: [
                    "id",
                    "restaurant_id",
                    "makanlist_id",
                    "createdAt",
                    "updatedAt",
                  ],
                });
              console.log(
                "Makanlist restaurant:",
                JSON.stringify(makanlistRestaurant, null, 2)
              );

              if (!makanlistRestaurant) {
                console.log(
                  `No makanlist restaurant found with id ${userActivity.targetId}`
                );
                targetDetails = {
                  error: `This activity refers to a makanlist restaurant that no longer exists`,
                };
                break;
              }

              // Fetch the makanlist
              const makanlist = await this.makanlistModel.findByPk(
                makanlistRestaurant.makanlist_id
              );
              console.log("Makanlist:", JSON.stringify(makanlist, null, 2));

              if (!makanlist) {
                console.log(
                  `No makanlist found with id ${makanlistRestaurant.makanlist_id}`
                );
                targetDetails = {
                  error: `This activity refers to a makanlist that no longer exists`,
                };
                break;
              }

              // Fetch the restaurant
              const restaurant = await this.restaurantModel.findByPk(
                makanlistRestaurant.restaurant_id
              );
              console.log("Restaurant:", JSON.stringify(restaurant, null, 2));
              if (!restaurant) {
                console.log(
                  `No restaurant found with id ${makanlistRestaurant.restaurant_id}`
                );
                targetDetails = {
                  error: `This activity refers to a restaurant that no longer exists`,
                };
                break;
              }

              targetDetails = { restaurant, makanlist };
              break;
            }
            case "restaurant": {
              const restaurant = await this.restaurantModel.findOne({
                where: { id: userActivity.targetId },
                include: [
                  {
                    model: this.userModel,
                    attributes: [
                      "id",
                      "email",
                      "username",
                      "photoUrl",
                      "lastLogin",
                    ],
                    as: "upvotedBy",
                  },
                ],
              });

              if (!restaurant) {
                console.log(
                  `No restaurant found with id ${userActivity.targetId}`
                );
                targetDetails = {
                  error: `This activity refers to a restaurant that no longer exists`,
                };
                break;
              }

              targetDetails = restaurant;
              break;
            }
            case "user": {
              const user = await this.userModel.findByPk(userActivity.targetId);

              if (!user) {
                console.log(`No user found with id ${activity.targetId}`);
                targetDetails = {
                  error: `This activity refers to a user that no longer exists`,
                };
                break;
              }

              targetDetails = user;
              break;
            }
            default:
              console.log(`Unexpected targetType: ${userActivity.targetType}`);
              targetDetails = null;
              break;
          }

          userActivity.targetDetails = targetDetails;
          return { ...userActivity.get({ plain: true }), targetDetails };
        })
      );

      return res.json(userActivitiesWithDetails);
    } catch (err) {
      console.log("Error fetching feed:", err);
      return res.status(400).json({ error: true, msg: err.message });
    }
  };
}

module.exports = UserActivitiesController;
