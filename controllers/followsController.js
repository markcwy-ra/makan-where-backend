/* eslint-disable no-unused-vars */
const BaseController = require("./baseController");

//------------ IMPORT CONSTANTS ------------//
const { NOT_FOUND, SERVER_ERROR } = require("../constants/statusCodes");
const {
  FOLLOW_SUCCESS,
  UNFOLLOW_SUCCESS,
  USER_NOT_FOUND,
  USER_OR_FOLLOWER_NOT_FOUND,
  FOLLOWER_NOT_FOUND,
} = require("../constants/messages");
//------------------------------------------//

class FollowsController extends BaseController {
  constructor(model, userActivityModel) {
    super(model);
    this.userActivityModel = userActivityModel;
  }

  // Follow user
  followUser = async (req, res) => {
    const { userId } = req.params; // ID of user being followed
    const { followerId } = req.body; // ID of user doing the following

    try {
      const user = await this.model.findByPk(userId);
      const follower = await this.model.findByPk(followerId);

      if (user && follower) {
        await follower.addFollowingUsers(user);

        // Log activity
        try {
          await this.userActivityModel.create({
            userId: followerId,
            activityType: "follow",
            targetId: userId,
            targetType: "user",
          });
        } catch (activityError) {
          console.log("Failed to log activity:", activityError);
        }

        return res.json({ success: true, msg: FOLLOW_SUCCESS });
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: USER_OR_FOLLOWER_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error following user:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
    }
  };

  // Unfollow user
  unfollowUser = async (req, res) => {
    const { userId } = req.params;
    const { followerId } = req.body;

    try {
      const user = await this.model.findByPk(userId);
      const follower = await this.model.findByPk(followerId);

      if (user && follower) {
        await follower.removeFollowingUsers(user);

        // Log activity
        try {
          await this.userActivityModel.create({
            userId: followerId,
            activityType: "unfollow",
            targetId: userId,
            targetType: "user",
          });
        } catch (activityError) {
          console.log("Failed to log activity:", activityError);
        }

        return res.json({ success: true, msg: UNFOLLOW_SUCCESS });
      } else {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: USER_OR_FOLLOWER_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error unfollowing user:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
    }
  };

  // Get user's followers
  getFollowers = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.model.findByPk(userId, {
        include: [
          {
            model: this.model,
            as: "followerUsers",
            attributes: { exclude: ["password"] },
          },
        ],
      });

      if (user) {
        return res.json({ success: true, followers: user.followerUsers });
      } else {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error getting user's followers:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
    }
  };

  // Count user's followers
  countFollowers = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.model.findByPk(userId);

      if (user) {
        const count = await user.countFollowerUsers();
        return res.json({ count });
      } else {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error counting user's followers:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
    }
  };

  // Get user's follows
  getFollows = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.model.findByPk(userId, {
        include: [
          {
            model: this.model,
            as: "followingUsers",
            attributes: { exclude: ["password"] },
          },
        ],
      });

      if (user) {
        return res.json({ success: true, following: user.followingUsers });
      } else {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error getting user's follows:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
    }
  };

  // Count user's follows
  countFollows = async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.model.findByPk(userId);

      if (user) {
        const count = await user.countFollowingUsers();
        return res.json({ count });
      } else {
        return res.status(NOT_FOUND).json({ error: true, msg: USER_NOT_FOUND });
      }
    } catch (err) {
      console.log("Error counting user's follows:", err);
      return res.status(SERVER_ERROR).json({ error: true, msg: err });
    }
  };

  // Check if user is following user
  getUserFollowStatus = async (req, res) => {
    const { userId, followerId } = req.params;

    try {
      const follower = await this.model.findByPk(followerId, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: this.model,
            as: "followingUsers",
            through: { attributes: [] },
          },
        ],
      });

      if (!follower) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: FOLLOWER_NOT_FOUND });
      }

      const user = await this.model.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res
          .status(NOT_FOUND)
          .json({ error: true, msg: FOLLOWER_NOT_FOUND });
      }

      const isFollowing = await follower.followingUsers.some(
        (followedUser) => followedUser.id === Number(userId)
      );

      return res.json({
        success: true,
        isFollowing,
        follower,
        user,
      });
    } catch (err) {
      console.log("Error checking follow status:", err);
      return res.status(SERVER_ERROR).json({ success: false, msg: err });
    }
  };
}

module.exports = FollowsController;
