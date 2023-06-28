const express = require("express");
const router = express.Router();

class RestaurantsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/search", this.controller.getRestaurants);
    router.get("/:placeId", this.controller.getOrAddRestaurant);

    return router;
  }
}

module.exports = RestaurantsRouter;
