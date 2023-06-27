const express = require("express");
const router = express.Router();

class RestaurantsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    return router;
  }
}

module.exports = RestaurantsRouter;
