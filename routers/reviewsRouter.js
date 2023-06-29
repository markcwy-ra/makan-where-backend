const express = require("express");
const router = express.Router();

class ReviewsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/:restaurantId/count", this.controller.countAllReviews);
    router.get("/:restaurantId", this.controller.getAllReviews);

    router.get("/user/:userId/count", this.controller.countAllUserReviews);
    router.get("/user/:userId", this.controller.getAllUserReviews);
    router.get(
      "/restaurant/:restaurantId/user/:userId",
      this.controller.getOneUserReview
    );

    router.post("/:restaurantId/add", this.controller.addReview);
    router.put("/:reviewId/update", this.controller.updateReview);
    router.delete("/:reviewId", this.controller.deleteReview);

    router.delete(
      "/:reviewId/upvote/remove",
      this.controller.removeReviewUpvote
    );
    router.post("/:reviewId/upvote", this.controller.upvoteReview);

    router.get("/:reviewId/upvotes/count", this.controller.countReviewUpvotes);
    router.get("/:reviewId/upvotes", this.controller.getReviewUpvotes);

    router.get(
      "/user/:userId/upvotes/count",
      this.controller.countUserUpvotedReviews
    );
    router.get("/user/:userId/upvotes", this.controller.getUserUpvotedReviews);

    return router;
  }
}

module.exports = ReviewsRouter;
