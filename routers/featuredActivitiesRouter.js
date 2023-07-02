const express = require("express");
const router = express.Router();

class FeaturedActivitiesRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/", this.verifyToken, this.controller.getFeaturedFeed);

    return router;
  }
}

module.exports = FeaturedActivitiesRouter;
