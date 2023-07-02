const express = require("express");
const router = express.Router();

class UserActivitiesRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/:userId", this.verifyToken, this.controller.getUserFeed);

    return router;
  }
}

module.exports = UserActivitiesRouter;
