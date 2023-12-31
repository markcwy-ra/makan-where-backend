const express = require("express");
const router = express.Router();

class FollowsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get(
      "/:userId/followers/count",
      this.verifyToken,
      this.controller.countFollowers
    );
    router.get(
      "/:userId/followers",
      this.verifyToken,
      this.controller.getFollowers
    );

    router.get(
      "/:userId/following/count",
      this.verifyToken,
      this.controller.countFollows
    );
    router.get(
      "/:userId/following",
      this.verifyToken,
      this.controller.getFollows
    );

    router.post("/:userId", this.verifyToken, this.controller.followUser);
    router.post(
      "/unfollow/:userId",
      this.verifyToken,
      this.controller.unfollowUser
    );

    router.get(
      "/:followerId/follow/:userId",
      this.verifyToken,
      this.controller.getUserFollowStatus
    );

    return router;
  }
}

module.exports = FollowsRouter;
