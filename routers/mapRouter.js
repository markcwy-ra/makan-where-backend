const express = require("express");
const router = express.Router();

class MapRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.get("/", this.verifyToken, this.controller.getRestaurantsInViewport);

    return router;
  }
}

module.exports = MapRouter;
