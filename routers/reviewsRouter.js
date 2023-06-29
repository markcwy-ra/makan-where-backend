const express = require("express");
const router = express.Router();

class ReviewsRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    return router;
  }
}

module.exports = ReviewsRouter;
