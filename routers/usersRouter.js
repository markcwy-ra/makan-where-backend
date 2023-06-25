const express = require("express");
const router = express.Router();

class UsersRouter {
  constructor(controller) {
    this.controller = controller;
  }

  routes() {
    return router;
  }
}

module.exports = UsersRouter;
