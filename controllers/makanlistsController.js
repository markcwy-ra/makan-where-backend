/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { Op } = require("sequelize");
const { calculateAndUpdateScore } = require("../utils/scoreUtils");

//------------ IMPORT CONSTANTS ------------//
const {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  SERVER_ERROR,
} = require("../constants/statusCodes");

const {
  RESTAURANT_MAKANLISTS_NOT_FOUND,
  USER_NOT_FOUND,
  RESTAURANT_NOT_FOUND,
  MAKANLIST_NOT_FOUND,
  MAKANLISTS_NOT_FOUND,
  USER_OR_MAKANLIST_NOT_FOUND,
  MAKANLIST_UPVOTE_REMOVED_SUCCESS,
  MAKANLIST_UPVOTED_SUCCESS,
  MAKANLIST_DELETED_SUCCESS,
  MAKANLIST_UPDATED_SUCCESS,
  MAKANLIST_TITLE_EXISTS,
  MAKANLIST_CREATED_SUCCESS,
  MAKANLIST_RESTAURANT_ALREADY_ADDED,
  MAKANLIST_RESTAURANT_ADDED_SUCCESS,
  MAKANLIST_RESTAURANT_REMOVED_SUCCESS,
} = require("../constants/messages");
//------------------------------------------//

class MakanlistsController extends BaseController {
  constructor(model, restaurantModel, userModel, userActivityModel) {
    super(model);
    this.restaurantModel = restaurantModel;
    this.userModel = userModel;
    this.userActivityModel = userActivityModel;
  }

  // Get all makanlists
  getAllMakanlists = async (req, res) => {
    try {
      const makanlists = await this.model.findAll({
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
      return res.json(makanlists);
    } catch (err) {
      console.log("Error fetching makanlists:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Get all makanlists that include a specific restaurant
  getAllMakanlistsForRestaurant = async (req, res) => {
    const { restaurantId } = req.params;

    try {
      const makanlists = await this.model.findAll({
        include: [
          {
            model: this.restaurantModel,
            where: { id: restaurantId },
            attributes: [],
          },
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
        ],
      });

      if (!makanlists || makanlists.length === 0) {
        return res.status(NOT_FOUND).json({
          error: true,
          msg: RESTAURANT_MAKANLISTS_NOT_FOUND,
        });
      }

      return res.json(makanlists);
    } catch (err) {
      console.log("Error fetching makanlists for restaurant:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Get all of user's makanlists
  getUserMakanlists = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const makanlists = await this.model.findAll({
        where: { userId },
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
      return res.json(makanlists);
    } catch (err) {
      console.log("Error fetching user's makanlists:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Count all of user's makanlists
  countUserMakanlists = async (req, res) => {
    const { userId } = req.params;

    try {
      const count = await this.model.count({ where: { userId } });

      return res.json({ count });
    } catch (err) {
      console.log("Error counting user's makanlists:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err.message });
    }
  };

  // Get one makanlist
  getOneMakanlist = async (req, res) => {
    const { userId, makanlistId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const makanlist = await this.model.findOne({
        where: { id: makanlistId, userId },
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
      return res.json(makanlist);
    } catch (err) {
      console.log("Error fetching makanlist:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err.message });
    }
  };

  // Create makanlist
  createMakanlist = async (req, res) => {
    const { userId, title, description, photoUrl } = req.body;

    try {
      const user = await this.userModel.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      // Find user's existing makanlists
      const existingMakanlists = await this.model.findAll({
        where: { userId },
      });

      // Check if makanlist already exists
      if (existingMakanlists) {
        for (let existingMakanlist of existingMakanlists) {
          if (existingMakanlist.title === title) {
            return res.status(FORBIDDEN).json({
              error: true,
              msg: MAKANLIST_TITLE_EXISTS,
            });
          }
        }
      }

      const newMakanlist = await this.model.create({
        userId,
        title,
        description,
        photoUrl,
      });

      // Log activity
      try {
        await this.userActivityModel.create({
          userId,
          activityType: "added",
          targetId: newMakanlist.id,
          targetType: "makanlist",
        });
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Calculate score
      await calculateAndUpdateScore(newMakanlist.id, "makanlist");

      return res.json({
        success: true,
        msg: MAKANLIST_CREATED_SUCCESS,
        newMakanlist,
        user,
      });
    } catch (err) {
      console.log("Error creating makanlist:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Add restaurant to makanlist
  addRestaurantToMakanlist = async (req, res) => {
    const { makanlistId, userId } = req.params;
    const { restaurantId } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }
      console.log("user:", user);

      const makanlist = await this.model.findByPk(makanlistId);
      if (!makanlist) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLIST_NOT_FOUND });
      }
      console.log("makanlist:", makanlist);

      const restaurant = await this.restaurantModel.findByPk(restaurantId);
      if (!restaurant) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: RESTAURANT_NOT_FOUND });
      }
      console.log("restaurant:", restaurant);

      // Check if restaurant already in makanlist
      const restaurantInMakanlist = await makanlist.getRestaurants({
        where: { id: restaurantId },
      });
      if (restaurantInMakanlist.length > 0) {
        return res
          .status(BAD_REQUEST)
          .json({ error: true, msg: MAKANLIST_RESTAURANT_ALREADY_ADDED });
      }

      await makanlist.addRestaurant(restaurant);
      console.log(
        `Restaurant id ${restaurantId} added to makanlist id ${makanlistId}`
      );

      // Get makanlist with restaurants
      const updatedMakanlist = await this.model.findOne({
        where: { id: makanlistId, userId },
        include: [
          {
            model: this.restaurantModel,
            where: { id: restaurantId },
            through: { attributes: ["id"] },
          },
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
        ],
      });
      console.log(
        "Updated makanlist:",
        JSON.stringify(updatedMakanlist, null, 2)
      );

      const makanlistRestaurant = updatedMakanlist.restaurants[0];
      console.log("Makanlist restaurant:", makanlistRestaurant);
      const makanlistRestaurantId =
        makanlistRestaurant.makanlist_restaurants.id;
      console.log("Makanlist restaurant id:", makanlistRestaurantId);

      // Log activity
      try {
        const userActivity = await this.userActivityModel.create({
          userId,
          activityType: "added",
          targetId: makanlistRestaurantId, // makanlist_restaurant.id
          targetType: "makanlistrestaurant",
        });
        console.log(
          "User activity created:",
          JSON.stringify(userActivity, null, 2)
        );
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Calculate score
      try {
        console.log(
          `Calculating and updating score for makanlistId ${makanlistId} and restaurantId ${restaurantId} for makanlist restaurant ${makanlistRestaurantId}`
        );

        await calculateAndUpdateScore(
          makanlistRestaurantId,
          "makanlistrestaurant",
          makanlistId,
          restaurantId
        );
      } catch (scoreError) {
        console.log("Failed to update score:", scoreError);
      }

      return res.json({
        success: true,
        msg: MAKANLIST_RESTAURANT_ADDED_SUCCESS,
        updatedMakanlist,
      });
    } catch (err) {
      console.log("Error adding restaurant to makanlist:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Update makanlist
  updateMakanlist = async (req, res) => {
    const { userId, makanlistId } = req.params;
    const { title, description, photoUrl } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const makanlist = await this.model.findByPk(makanlistId);
      if (!makanlist) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLIST_NOT_FOUND });
      }
      let preFlightList = {
        title,
        description,
      };

      if (photoUrl) {
        preFlightList = { ...preFlightList, photoUrl };
      }

      await this.model.update(preFlightList, {
        where: { id: makanlistId, userId },
      });

      const updatedMakanlist = await this.model.findOne({
        where: { id: makanlistId, userId },
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

      // Log activity
      try {
        await this.userActivityModel.create({
          userId,
          activityType: "updated",
          targetId: updatedMakanlist.id,
          targetType: "makanlist",
        });
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Calculate score
      await calculateAndUpdateScore(updatedMakanlist.id, "makanlist");

      return res.json({
        success: true,
        msg: MAKANLIST_UPDATED_SUCCESS,
        updatedMakanlist,
      });
    } catch (err) {
      console.log("Error updating makanlist:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Remove restaurant from makanlist
  removeRestaurantFromMakanlist = async (req, res) => {
    const { userId, makanlistId, restaurantId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const makanlist = await this.model.findOne({
        where: { id: makanlistId, userId },
        include: [
          {
            model: this.restaurantModel,
            where: { id: restaurantId },
            through: { attributes: ["id"] },
          },
        ],
      });

      if (!makanlist) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLIST_NOT_FOUND });
      }

      const makanlistRestaurant = makanlist.restaurants[0];

      if (!makanlistRestaurant) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: RESTAURANT_NOT_FOUND });
      }

      // Log activity
      try {
        await this.userActivityModel.create({
          userId,
          activityType: "deleted",
          targetId: makanlistRestaurant.id,
          targetType: "makanlistrestaurant",
        });
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Calculate score
      try {
        console.log(
          `Calculating and updating score for makanlistId ${makanlistId} and restaurantId ${restaurantId} for makanlist restaurant ${makanlistRestaurant.id}`
        );

        await calculateAndUpdateScore(
          makanlistRestaurant.id,
          "makanlistrestaurant",
          makanlistId,
          restaurantId
        );
      } catch (scoreError) {
        console.log("Failed to update score:", scoreError);
      }

      await makanlist.removeRestaurant(makanlistRestaurant);

      const updatedMakanlist = await makanlist.getRestaurants();

      return res.json({
        success: true,
        msg: MAKANLIST_RESTAURANT_REMOVED_SUCCESS,
        makanlistRestaurant,
        updatedMakanlist,
      });
    } catch (err) {
      console.log("Error removing restaurant from makanlist:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Delete makanlist
  deleteMakanlist = async (req, res) => {
    const { userId, makanlistId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const makanlist = await this.model.findOne({
        where: { id: makanlistId, userId },
        include: this.restaurantModel,
      });

      if (!makanlist) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLIST_NOT_FOUND });
      }

      // Log activity
      try {
        await this.userActivityModel.create({
          userId,
          activityType: "deleted",
          targetId: makanlistId,
          targetType: "makanlist",
        });
      } catch (activityError) {
        console.log("Failed to log activity:", activityError);
      }

      // Calculate score
      await calculateAndUpdateScore(makanlistId, "makanlist");

      // Get and remove upvotes related to makanlist
      const upvotes = await makanlist.getUpvotedBy();
      await makanlist.removeUpvotedBy(upvotes);

      // Get and remove restaurants in makanlist
      const restaurantsInMakanlist = await makanlist.getRestaurants();
      await makanlist.removeRestaurants(restaurantsInMakanlist);

      // Then remove makanlist
      await makanlist.destroy();

      return res.json({ success: true, msg: MAKANLIST_DELETED_SUCCESS });
    } catch (err) {
      console.log("Error deleting makanlist:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Upvote makanlist
  upvoteMakanlist = async (req, res) => {
    const { makanlistId } = req.params;
    const { userId } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      const makanlist = await this.model.findByPk(makanlistId);

      if (user && makanlist) {
        await user.addUpvotedMakanlists(makanlist);

        // Log activity
        try {
          await this.userActivityModel.create({
            userId,
            activityType: "upvoted",
            targetId: makanlistId,
            targetType: "makanlist",
          });
        } catch (activityError) {
          console.log("Failed to log activity:", activityError);
        }

        // Calculate score
        await calculateAndUpdateScore(makanlistId, "makanlist");

        return res.json({
          success: true,
          msg: MAKANLIST_UPVOTED_SUCCESS,
        });
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: USER_OR_MAKANLIST_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error upvoting review:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Remove makanlist upvote
  removeMakanlistUpvote = async (req, res) => {
    const { makanlistId, userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const makanlist = await this.model.findByPk(makanlistId);

      if (user && makanlist) {
        // Log activity
        try {
          await this.userActivityModel.create({
            userId,
            activityType: "removed upvote",
            targetId: makanlistId,
            targetType: "makanlist",
          });
        } catch (activityError) {
          console.log("Failed to log activity:", activityError);
        }

        // Calculate score
        await (makanlistId, "makanlist");

        await user.removeUpvotedMakanlists(makanlist);

        return res.json({
          success: true,
          msg: MAKANLIST_UPVOTE_REMOVED_SUCCESS,
        });
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: USER_OR_MAKANLIST_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error removing makanlist upvote:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Get all users who upvoted makanlist
  getMakanlistUpvotes = async (req, res) => {
    const { makanlistId } = req.params;

    try {
      const makanlist = await this.model.findByPk(makanlistId);

      if (makanlist) {
        const upvotes = await makanlist.getUpvotedBy({
          attributes: { exclude: ["password"] },
        });
        return res.json(upvotes);
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLIST_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error getting makanlist upvotes:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err.message });
    }
  };

  // Count all users who upvoted makanlist
  countMakanlistUpvotes = async (req, res) => {
    const { makanlistId } = req.params;

    try {
      const makanlist = await this.model.findByPk(makanlistId);

      if (makanlist) {
        const count = await makanlist.countUpvotedBy();
        return res.json({ count });
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLIST_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error counting makanlist upvotes:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err.message });
    }
  };

  // Get all makanlists upvoted by user
  getUserUpvotedMakanlists = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const upvotedMakanlists = await user.getUpvotedMakanlists({
        include: [
          {
            model: this.userModel,
            attributes: ["id", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
            through: {
              attributes: [],
            },
          },
        ],
      });
      return res.json({ upvotedMakanlists });
    } catch (err) {
      console.log("Error fetching user's upvoted makanlists");
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Count all makanlists upvoted by user
  countUserUpvotedMakanlists = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      const upvotedMakanlists = await user.getUpvotedMakanlists();
      const count = upvotedMakanlists.length;
      return res.json({ count });
    } catch (err) {
      console.log("Error counting user's upvoted makanlists");
      return res.status(SERVER_ERROR).json({ error: true, msg: err.message });
    }
  };

  // Check if user has upvoted makanlist
  getUserUpvoteStatusForMakanlist = async (req, res) => {
    const { makanlistId, userId } = req.params;
    try {
      const user = await this.userModel.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const makanlist = await this.model.findByPk(makanlistId);
      if (!makanlist) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLIST_NOT_FOUND });
      }

      const upvotedMakanlists = await user.getUpvotedMakanlists();
      const hasUpvoted = upvotedMakanlists.some(
        (makanlist) => makanlist.id === Number(makanlistId)
      );

      return res.json({
        success: true,
        hasUpvoted,
        user,
        makanlist,
      });
    } catch (err) {
      console.log("Error checking upvote status for makanlists:", err);
      return res
        .status(SERVER_ERROR)
        .json({ success: false, msg: err.message });
    }
  };

  // Get upvotes for user's makanlists
  getUserMakanlistsUpvotes = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const upvotedMakanlists = await user.getUpvotedMakanlists({
        include: [
          {
            model: this.userModel,
            attributes: ["id", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
            through: {
              attributes: [],
            },
          },
        ],
      });

      return res.json({
        success: true,
        upvotedMakanlists,
      });
    } catch (err) {
      console.log("Error getting upvotes for user's makanlists:", err);
      return res
        .status(SERVER_ERROR)
        .json({ success: false, msg: err.message });
    }
  };

  // Get search results for makanlists by title
  searchMakanlistsByTitle = async (req, res) => {
    const { title } = req.params;

    try {
      // Find all makanlists with title that match search term
      const makanlists = await this.model.findAll({
        where: {
          title: {
            [Op.iLike]: `%${title}%`,
          },
        },
        include: [
          {
            model: this.userModel,
            attributes: ["id", "username", "photoUrl"],
          },
          {
            model: this.restaurantModel,
            through: {
              attributes: [],
            },
          },
        ],
      });

      if (makanlists.length === 0) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: MAKANLISTS_NOT_FOUND });
      }

      return res.json(makanlists);
    } catch (err) {
      console.log("Error fetching makanlists for search:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err.message });
    }
  };
}

module.exports = MakanlistsController;
