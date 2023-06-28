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

    router.post("/:restaurantId/upvote", this.controller.upvoteRestaurant);
    router.delete(
      "/:restaurantId/upvote/remove",
      this.controller.removeRestaurantUpvote
    );

    router.get("/:restaurantId/upvotes", this.controller.getRestaurantUpvotes);
    router.get(
      "/:restaurantId/upvotes/count",
      this.controller.countRestaurantUpvotes
    );

    router.get("/user/:userId/upvotes", this.controller.getUserUpvotes);
    router.get("/user/:userId/upvotes/count", this.controller.countUserUpvotes);

    return router;
  }
}

module.exports = RestaurantsRouter;
