const express = require("express");
const router = express.Router();

class UsersRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/", this.verifyToken, this.controller.getCurrentUser);
    router.get("/:userId", this.controller.getUserProfile);
    router.put(
      "/:userId/update",
      this.verifyToken,
      this.controller.updateUserProfile
    );
    router.delete("/:userId", this.verifyToken, this.controller.deleteUser);

    router.get("/search/:username", this.controller.searchUsersByUsername);

    return router;
  }
}

module.exports = UsersRouter;
