/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = 10;

//------------ IMPORT CONSTANTS -----------//
const {
  CREATED,
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
} = require("../constants/statusCodes");

const {
  WRONG_PASSWORD,
  USER_RETRIEVED_SUCCESS,
  USER_NOT_FOUND,
  USER_DELETED_SUCCESS,
  USERS_NOT_FOUND,
} = require("../constants/messages");
//------------------------------------------//

class UsersController extends BaseController {
  constructor(model, refreshTokenModel, locationModel) {
    super(model);
    this.refreshTokenModel = refreshTokenModel;
    this.locationModel = locationModel;
  }

  // Get current user profile
  getCurrentUser = async (req, res) => {
    const token = req.headers["refresh-token"];
    try {
      const tokenId = await this.refreshTokenModel.findOne({
        where: { token: token },
      });
      const user = await this.model.findByPk(tokenId.userId);
      const location = await this.locationModel.findOne({
        where: { id: user.locationId },
      });

      return res.status(CREATED).json({
        success: true,
        msg: USER_RETRIEVED_SUCCESS,
        data: {
          username: user.username,
          id: user.id,
          email: user.email,
          photoUrl: user.photoUrl,
          locationId: user.locationId,
          location,
        },
      });
    } catch (err) {
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
    }
  };

  // Get user profile
  getUserProfile = async (req, res) => {
    const { userId } = req.params;

    try {
      // Get user's profile from database
      const user = await this.model.findByPk(userId);

      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      return res.status(CREATED).json({
        success: true,
        msg: USER_RETRIEVED_SUCCESS,
        data: {
          username: user.username,
          id: user.id,
          email: user.email,
          photoUrl: user.photoUrl,
        },
      });
    } catch (err) {
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
    }
  };

  // Update user profile
  updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const {
      username,
      email,
      currentPassword,
      newPassword,
      photoUrl,
      country,
      countryCode,
      latitude,
      longitude,
    } = req.body;

    try {
      // Get user from db
      const user = await this.model.findByPk(userId);

      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      let hashedPassword = null;
      // Hash new password
      if (currentPassword && newPassword) {
        const compare = await bcrypt.compare(currentPassword, user.password);

        // Check if current password is correct
        if (!compare) {
          return res.status(FORBIDDEN).json({
            success: false,
            msg: WRONG_PASSWORD,
          });
        }
        // Create new password
        hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      }

      // Create new location or find existing one
      const [location, created] = await this.locationModel.findOrCreate({
        where: { name: countryCode, latitude, longitude },
        defaults: {
          name: countryCode,
          city: country,
          country: country,
          latitude: latitude,
          longitude: longitude,
        },
      });

      // Generate new user before update
      let preFlightUser = {
        username,
        email,
        locationId: location.id,
      };
      // If there's a new password, save it
      if (hashedPassword) {
        preFlightUser = { ...preFlightUser, password: hashedPassword };
      }
      // If there's a new photoUrl, save it
      if (photoUrl) {
        preFlightUser = { ...preFlightUser, photoUrl };
      }

      // Update user
      await this.model.update(preFlightUser, { where: { id: userId } });

      const updatedUser = await this.model.findByPk(userId);

      return res.json({
        success: true,
        msg: `User ${updatedUser.username} successfully updated profile`,
        data: { updatedUser, location },
      });
    } catch (err) {
      console.log("Error updating user profile:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err.message });
    }
  };

  // Delete user
  deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.model.findByPk(userId);

      if (!user) {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }

      const deletedUser = await this.model.destroy({
        where: {
          id: userId,
        },
      });

      return res.json({
        success: true,
        msg: USER_DELETED_SUCCESS,
        user: deletedUser.userId,
      });
    } catch (err) {
      console.log("Error deleting user:", err);
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
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
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: USERS_NOT_FOUND });
      }

      const usersCleaned = users.map((user) => ({
        id: user.id,
        username: user.username,
        photoUrl: user.photoUrl,
      }));

      return res.json(usersCleaned);
    } catch (err) {
      return res.status(BAD_REQUEST).json({ error: true, msg: err });
    }
  };
}

module.exports = UsersController;
