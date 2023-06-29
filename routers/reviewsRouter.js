const express = require("express");
const router = express.Router();

class ReviewsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get(
      "/:restaurantId/count",
      this.verifyToken,
      this.controller.countAllReviews
    );
    router.get(
      "/:restaurantId",
      this.verifyToken,
      this.controller.getAllReviews
    );

    router.get(
      "/user/:userId/count",
      this.verifyToken,
      this.controller.countAllUserReviews
    );
    router.get(
      "/user/:userId",
      this.verifyToken,
      this.controller.getAllUserReviews
    );
    router.get(
      "/restaurant/:restaurantId/user/:userId",
      this.verifyToken,
      this.controller.getOneUserReview
    );

    router.post(
      "/:restaurantId/add",
      this.verifyToken,
      this.controller.addReview
    );
    router.put(
      "/:reviewId/update",
      this.verifyToken,
      this.controller.updateReview
    );
    router.delete("/:reviewId", this.verifyToken, this.controller.deleteReview);

    router.delete(
      "/:reviewId/upvote/remove",
      this.verifyToken,
      this.controller.removeReviewUpvote
    );
    router.post(
      "/:reviewId/upvote",
      this.verifyToken,
      this.controller.upvoteReview
    );

    router.get(
      "/:reviewId/upvotes/count",
      this.verifyToken,
      this.controller.countReviewUpvotes
    );
    router.get(
      "/:reviewId/upvotes",
      this.verifyToken,
      this.controller.getReviewUpvotes
    );

    router.get(
      "/user/:userId/upvotes/count",
      this.verifyToken,
      this.controller.countUserUpvotedReviews
    );
    router.get(
      "/user/:userId/upvotes",
      this.verifyToken,
      this.controller.getUserUpvotedReviews
    );

    return router;
  }
}

module.exports = ReviewsRouter;
