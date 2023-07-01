const express = require("express");
const router = express.Router();

class MakanlistsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/", this.verifyToken, this.controller.getAllMakanlists);
    router.post("/", this.verifyToken, this.controller.createMakanlist);

    router.get(
      "/user/:userId/count",
      this.verifyToken,
      this.controller.countUserMakanlists
    );
    router.get(
      "/user/:userId",
      this.verifyToken,
      this.controller.getUserMakanlists
    );

    router.post(
      "/user/:userId/:makanlistId",
      this.verifyToken,
      this.controller.addRestaurantToMakanlist
    );
    router.put(
      "/user/:userId/:makanlistId",
      this.verifyToken,
      this.controller.updateMakanlist
    );
    router.put(
      "/user/:userId/:makanlistId/restaurant/:restaurantId",
      this.verifyToken,
      this.controller.removeRestaurantFromMakanlist
    );
    router.delete(
      "/user/:userId/:makanlistId",
      this.verifyToken,
      this.controller.deleteMakanlist
    );

    router.get(
      "/:makanlistId/upvote/:userId",
      this.verifyToken,
      this.controller.getUserUpvoteStatusForMakanlist
    );

    router.post(
      "/:makanlistId/upvote",
      this.verifyToken,
      this.controller.upvoteMakanlist
    );
    router.delete(
      "/:makanlistId/upvote",
      this.verifyToken,
      this.controller.removeMakanlistUpvote
    );

    router.get(
      "/:makanlistId/upvotes/count",
      this.verifyToken,
      this.controller.countMakanlistUpvotes
    );
    router.get(
      "/:makanlistId/upvotes",
      this.verifyToken,
      this.controller.getMakanlistUpvotes
    );

    router.get(
      "/user/:userId/upvotes/count",
      this.verifyToken,
      this.controller.countUserUpvotedMakanlists
    );
    router.get(
      "/user/:userId/upvotes",
      this.verifyToken,
      this.controller.getUserUpvotedMakanlists
    );
    router.get(
      "/user/:userId/all/upvotes",
      this.verifyToken,
      this.controller.getUserMakanlistsUpvotes
    );
    router.get(
      "/user/:userId/:makanlistId",
      this.verifyToken,
      this.controller.getOneMakanlist
    );

    router.get(
      "/search/:title",
      this.verifyToken,
      this.controller.searchMakanlistsByTitle
    );

    return router;
  }
}

module.exports = MakanlistsRouter;
