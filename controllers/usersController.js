/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { Op } = require("sequelize");

class UsersController extends BaseController {
  constructor(model, refreshTokenModel) {
    super(model);
    this.refreshTokenModel = refreshTokenModel;
  }

  // Get current user profile
  getCurrentUser = async (req, res) => {
    const token = req.headers["refresh-token"];
    try {
      const tokenId = await this.refreshTokenModel.findOne({
        where: { token: token },
      });
      const user = await this.model.findByPk(tokenId.userId);
      return res.status(201).json({
        success: true,
        msg: "User data retrieved.",
        data: {
          username: user.username,
          id: user.id,
          email: user.email,
          photoUrl: user.photoUrl,
        },
      });
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Get user profile
  getUserProfile = async (req, res) => {
    const { userId } = req.params;

    try {
      // Get user's profile from database
      const user = await this.model.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      return res.json(user);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Update user profile
  updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    // const { username, email, address, photoUrl } = req.body;

    try {
      // Get user from db
      const user = await this.model.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      await user.update(req.body);

      const updatedUser = await this.model.findByPk(userId);

      return res.json(updatedUser);
    } catch (err) {
      console.log("Error updating user profile:", err);
      return res.status(400).json({ error: true, msg: err.message });
    }
  };

  // Delete user
  deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.model.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      const deletedUser = await this.model.destroy({
        where: {
          id: userId,
        },
      });

      return res.json({
        success: true,
        msg: "User deleted successfully",
        user: deletedUser.userId,
      });
    } catch (err) {
      console.log("Error deleting user:", err);
      return res.status(400).json({ error: true, msg: err });
    }
  };

  // Get search results for users by username
  searchUsersByUsername = async (req, res) => {
    const { username } = req.params;

    try {
      // Find all users whose username matches search term
      const users = await this.model.findAll({
        where: {
          username: {
            [Op.like]: `%${username}%`,
          },
        },
      });

      if (users.length === 0) {
        return res.status(404).json({ error: true, msg: "No users found" });
      }

      return res.json(users);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  };
}

module.exports = UsersController;
