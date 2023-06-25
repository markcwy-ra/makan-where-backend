const express = require("express");
const router = express.Router();

class AuthRouter {
  constructor(controller) {
    this.controller = controller;
  }

  routes() {
    return router;
  }
}

module.exports = AuthRouter;
