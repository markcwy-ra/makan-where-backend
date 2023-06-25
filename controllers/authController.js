const BaseController = require("./baseController");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

class AuthController extends BaseController {
  constructor(model) {
    super(model);
  }

  // Sign up new user

  // Sign in existing user

  // Sign out user

  // Reset password

  // Refresh token

  // Generate new token
}

module.exports = AuthController;
