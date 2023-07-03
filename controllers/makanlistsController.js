/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { Op } = require("sequelize");
const { calculateAndUpdateScore } = require("../utils/scoreUtils");

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
      return res.status(500).json({ error: true, msg: err.message });
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
          },
          {
            model: this.userModel,
            attributes: ["id", "email", "username", "photoUrl"],
          },
        ],
      });

      if (!makanlists || makanlists.length === 0) {
        return res.status(404).json({
          error: true,
          msg: "No makanlists found for this restaurant",
        });
      }

      return res.json(makanlists);
    } catch (err) {
      console.log("Error fetching makanlists for restaurant:", err);
      return res.status(500).json({ error: true, msg: err.message });
    }
  };

  // Get all of user's makanlists
  getUserMakanlists = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
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
      return res.status(500).json({ error: true, msg: err.message });
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
      return res.status(400).json({ error: true, msg: err.message });
    }
  };

  // Get one makanlist
  getOneMakanlist = async (req, res) => {
    const { userId, makanlistId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
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
      return res.status(400).json({ error: true, msg: err.message });
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
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      // Find user's existing makanlists
      const existingMakanlists = await this.model.findAll({
        where: { userId },
      });

      // Check if makanlist already exists
      if (existingMakanlists) {
        for (let existingMakanlist of existingMakanlists) {
          if (existingMakanlist.title === title) {
            return res.status(403).json({
              error: true,
              msg: "Makanlist with this title already exists",
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
        msg: "Makanlist created successfully",
        newMakanlist,
        user,
      });
    } catch (err) {
      console.log("Error creating makanlist:", err);
      return res.status(500).json({ error: true, msg: err.message });
    }
  };

  // Add restaurant to makanlist
  addRestaurantToMakanlist = async (req, res) => {
    const { makanlistId, userId } = req.params;
    const { restaurantId } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }
      console.log("user:", user);

      const makanlist = await this.model.findByPk(makanlistId);
      if (!makanlist) {
        return res
          .status(404)
          .json({ error: true, msg: "Makanlist not found" });
      }
      console.log("makanlist:", makanlist);

      const restaurant = await this.restaurantModel.findByPk(restaurantId);
      if (!restaurant) {
        return res
          .status(404)
          .json({ error: true, msg: "Restaurant not found" });
      }
      console.log("restaurant:", restaurant);

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
        msg: "Restaurant successfully added to makanlist",
        updatedMakanlist,
      });
    } catch (err) {
      console.log("Error adding restaurant to makanlist:", err);
      return res.status(500).json({ error: true, msg: err.message });
    }
  };

  // Update makanlist
  updateMakanlist = async (req, res) => {
    const { userId, makanlistId } = req.params;
    const { title, description, photoUrl } = req.body;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const makanlist = await this.model.findByPk(makanlistId);
      if (!makanlist) {
        return res
          .status(404)
          .json({ error: true, msg: "Makanlist not found" });
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
        msg: "Makanlist successfully updated",
        updatedMakanlist,
      });
    } catch (err) {
      console.log("Error updating makanlist:", err);
      return res.status(500).json({ error: true, msg: err.message });
    }
  };

  // Remove restaurant from makanlist
  removeRestaurantFromMakanlist = async (req, res) => {
    const { userId, makanlistId, restaurantId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
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
          .status(404)
          .json({ error: true, msg: "Makanlist not found" });
      }

      const makanlistRestaurant = makanlist.restaurants[0];

      if (!makanlistRestaurant) {
        return res
          .status(404)
          .json({ error: true, msg: "Restaurant not found" });
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
        msg: "Restaurant successfully removed from makanlist",
        makanlistRestaurant,
        updatedMakanlist,
      });
    } catch (err) {
      console.log("Error removing restaurant from makanlist:", err);
      return res.status(500).json({ error: true, msg: err.message });
    }
  };

  // Delete makanlist
  deleteMakanlist = async (req, res) => {
    const { userId, makanlistId } = req.params;

    try {
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const makanlist = await this.model.findOne({
        where: { id: makanlistId, userId },
        include: this.restaurantModel,
      });

      if (!makanlist) {
        return res
          .status(404)
          .json({ error: true, msg: "Makanlist not found" });
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

      return res.json({ success: true, msg: "Makanlist deleted" });
    } catch (err) {
      console.log("Error deleting makanlist:", err);
      return res.status(500).json({ error: true, msg: err.message });
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
          msg: "Successfully upvoted makanlist",
        });
      } else {
        return res
          .status(404)
          .json({ error: true, msg: "User or makanlist not found" });
      }
    } catch (err) {
      console.log("Error upvoting review:", err);
      return res.status(500).json({ error: true, msg: err.message });
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
          msg: "Successfully removed makanlist upvote",
        });
      } else {
        return res
          .status(404)
          .json({ error: true, msg: "User or makanlist not found" });
      }
    } catch (err) {
      console.log("Error removing makanlist upvote:", err);
      return res.status(500).json({ error: true, msg: err.message });
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
          .status(404)
          .json({ error: true, msg: "Makanlist not found" });
      }
    } catch (err) {
      console.log("Error getting makanlist upvotes:", err);
      return res.status(400).json({ error: true, msg: err.message });
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
          .status(404)
          .json({ error: true, msg: "Makanlist not found" });
      }
    } catch (err) {
      console.log("Error counting makanlist upvotes:", err);
      return res.status(400).json({ error: true, msg: err.message });
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
      return res.status(500).json({ error: true, msg: err.message });
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
      return res.status(500).json({ error: true, msg: err.message });
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
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const makanlist = await this.model.findByPk(makanlistId);
      if (!makanlist) {
        return res
          .status(404)
          .json({ error: true, msg: "Makanlist not found" });
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
      return res.status(500).json({ success: false, msg: err.message });
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
        return res.status(404).json({ error: true, msg: "User not found" });
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
      return res.status(500).json({ success: false, msg: err.message });
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
          .status(404)
          .json({ error: true, msg: "No makanlists found" });
      }

      return res.json(makanlists);
    } catch (err) {
      console.log("Error fetching makanlists for search:", err);
      return res.status(400).json({ error: true, msg: err.message });
    }
  };
}

module.exports = MakanlistsController;
