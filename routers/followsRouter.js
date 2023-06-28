const express = require("express");
const router = express.Router();

class FollowsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.post("/:userId", this.verifyToken, this.controller.followUser);
    router.delete("/:userId", this.verifyToken, this.controller.unfollowUser);

    router.get(
      "/followers/:userId",
      this.verifyToken,
      this.controller.getFollowers
    );
    router.get(
      "/followers/:userId/count",
      this.verifyToken,
      this.controller.countFollowers
    );

    router.get(
      "/:userId/following",
      this.verifyToken,
      this.controller.getFollows
    );
    router.get(
      "/:userId/following/count",
      this.verifyToken,
      this.controller.countFollows
    );

    return router;
  }
}

module.exports = FollowsRouter;
