const express = require("express");
const router = express.Router();

class AuthRouter {
  constructor(controller, verifyToken) {
    this.controller = controller;
    this.verifyToken = verifyToken;
  }

  routes() {
    router.post("/sign-up", this.controller.signUp);
    router.post("/sign-in", this.controller.signIn);
    router.post("/sign-out", this.controller.signOut);

    router.post("/email-reset", this.controller.initiatePasswordReset);
    router.post("/reset-password", this.controller.resetPassword);

    router.post("/refresh", this.controller.refreshToken);

    return router;
  }
}

module.exports = AuthRouter;
