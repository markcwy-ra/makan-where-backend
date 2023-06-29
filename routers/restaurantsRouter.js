const express = require("express");
const router = express.Router();

class RestaurantsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/search", this.verifyToken, this.controller.getRestaurants);
    router.get(
      "/:placeId",
      this.verifyToken,
      this.controller.getOrAddRestaurant
    );

    router.post(
      "/:restaurantId/upvote",
      this.verifyToken,
      this.controller.upvoteRestaurant
    );

    // router.get(
    //   "/:restaurantId/upvote/:userId",
    //   this.verifyToken,
    //   this.controller.getUserUpvoteStatus
    // );

    router.delete(
      "/:restaurantId/upvote/remove",
      this.verifyToken,
      this.controller.removeRestaurantUpvote
    );

    router.get(
      "/:restaurantId/upvotes/count",
      this.verifyToken,
      this.controller.countRestaurantUpvotes
    );
    router.get(
      "/:restaurantId/upvotes",
      this.verifyToken,
      this.controller.getRestaurantUpvotes
    );

    router.get(
      "/user/:userId/upvotes/count",
      this.verifyToken,
      this.controller.countUserUpvotes
    );
    router.get(
      "/user/:userId/upvotes",
      this.verifyToken,
      this.controller.getUserUpvotes
    );

    return router;
  }
}

module.exports = RestaurantsRouter;
