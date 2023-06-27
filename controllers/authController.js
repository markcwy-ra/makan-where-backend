const BaseController = require("./baseController");
const { generateResetToken, hashToken } = require("../utils/tokenUtils");
const createTransporter = require("../config/emailConfig");
const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

class AuthController extends BaseController {
  constructor(model, refreshTokenModel, passwordResetTokenModel) {
    super(model);
    this.refreshTokenModel = refreshTokenModel;
    this.passwordResetTokenModel = passwordResetTokenModel;
  }
  // Sign up new user
  signUp = async (req, res) => {
    const { email, password, username } = req.body;

    // Check if all fields provided
    if (!email || !password || !username) {
      return res.status(401).json({
        success: false,
        msg: "Missing email, password, or username",
      });
    }

    try {
      // Check if user already exists
      const existingUser = await this.model.findOne({ where: { email } });

      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, msg: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = await this.model.create({
        email,
        password: hashedPassword,
        username,
        lastLogin: new Date(),
      });

      // Create JWT
      const payload = {
        id: newUser.id,
        username: newUser.username,
      };
      const token = this.generateToken(payload);
      const refreshToken = this.generateToken(payload, true);

      const expiresAt = new Date();
      expiresAt.setSeconds(
        expiresAt.getSeconds() +
          parseInt(process.env.REFRESH_EXPIRATION_MS) / 1000
      );

      await this.saveToken(refreshToken, newUser.id, expiresAt);

      // Send tokens in response
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: process.env.REFRESH_MAX_AGE * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        msg: "User registered successfully",
        data: { token, refreshToken },
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, msg: "Error saving refresh token" });
    }
  };

  // Sign in existing user
  signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await this.model.findOne({ where: { email } });

      if (!user) {
        return res
          .status(401)
          .json({ success: false, msg: "Invalid credentials" });
      }

      const compare = await bcrypt.compare(password, user.password);

      // If passwords don't match
      if (!compare) {
        return res
          .status(403)
          .json({ success: false, msg: "Invalid credentials" });
      }

      // If passwords match
      const payload = { id: user.id, username: user.username };
      const token = this.generateToken(payload);
      const refreshToken = this.generateToken(payload, true);

      await this.saveToken(refreshToken, user.id, true);

      // Send tokens in response
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: process.env.REFRESH_MAX_AGE * 24 * 60 * 60 * 1000,
      });

      // Update user's last login time
      user.lastLogin = new Date();
      await user.save();

      return res.status(200).json({
        success: true,
        msg: "User authenticated successfully",
        data: { token, refreshToken },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: "Error logging in" });
    }
  };

  // Sign out user
  signOut = async (req, res) => {
    const refreshToken = req.headers["x-refresh-token"];
    // const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, msg: "No refresh token provided" });
    }

    try {
      // Find token in database
      const token = await this.refreshTokenModel.findOne({
        where: { token: refreshToken },
      });

      if (token) {
        // Update refresh token validity to false
        await token.update({ isValid: false });
      }

      // Clear refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
      });

      return res
        .status(200)
        .json({ success: true, msg: "User signed out successfully" });
    } catch (err) {
      console.log("Error signing out user:", err);
      return res
        .status(500)
        .json({ success: false, msg: "Error signing out user" });
    }
  };

  // Initiate password reset
  initiatePasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
      // Find user in database
      const user = await this.model.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found" });
      }

      // Generate reset token
      const resetToken = generateResetToken();

      // Create transporter using createTransporter function
      const transporter = await createTransporter();

      // Construct email message
      const message = {
        from: '"Makan Where" <no-reply@makanwhere.com>',
        to: user.email,
        subject: "Password Reset",
        text: `Here is your password reset token: ${resetToken}`,
      };

      // Send email using the transporter
      await transporter.sendMail(message);

      // Store reset token in database
      const resetTokenData = await this.passwordResetTokenModel.create({
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + parseInt(process.env.RESET_EXPIRATION_MS)
        ),
        isValid: true,
      });

      console.log("Message sent: %s", message.messageId);
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));

      return res.json({
        success: true,
        msg: "Password reset initiated. Check your email for instructions.",
        data: resetTokenData,
      });
    } catch (err) {
      console.log("Error initiating password reset:", err);
      return res
        .status(500)
        .json({ success: false, msg: "Error initiating password reset" });
    }
  };

  // Reset password
  resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    let user;

    try {
      // Reset via email
      if (resetToken && newPassword) {
        // Find token in database
        // const hashedResetToken = hashToken(resetToken);
        const tokenData = await this.passwordResetTokenModel.findOne({
          where: { token: resetToken },
        });

        if (
          !tokenData ||
          tokenData.expiresAt < new Date() ||
          !tokenData.isValid
        ) {
          return res
            .status(400)
            .json({ success: false, msg: "Invalid or expired reset token" });
        }

        // Find user in database
        user = await this.model.findByPk(tokenData.userId);

        if (!user) {
          return res
            .status(404)
            .json({ success: false, msg: "User not found" });
        }

        // Invalidate token
        await tokenData.update({ isValid: false });
      }

      // Reset via user profile
      if (!resetToken && newPassword) {
        // Authenticate user
        const { userId } = req.user;

        // Find user by ID
        user = await this.model.findByPk(userId);

        if (!user) {
          return res
            .status(404)
            .json({ success: false, msg: "User not found" });
        }
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await user.update({ password: hashedPassword });

      return res.json({ success: true, msg: "Password reset successfully" });
    } catch (err) {
      console.log("Error resetting password:", err);
      return res
        .status(500)
        .json({ success: false, msg: "Error resetting password" });
    }
  };

  // Refresh token
  refreshToken = async (req, res) => {
    // While testing:
    const refreshToken = req.headers["x-refresh-token"];

    // const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, msg: "No refresh token provided" });
    }

    try {
      // Verify refresh token
      const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

      // Check if token is in database
      const tokenEntry = await this.refreshTokenModel.findOne({
        where: { token: refreshToken, isValid: true },
      });

      // If refresh token not found or invalid
      if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
        return res
          .status(403)
          .json({ success: false, msg: "Invalid refresh token" });
      }

      // Generate new JWT
      const payload = {
        id: decodedToken.id,
        username: decodedToken.username,
      };

      const newToken = this.generateToken(payload);

      // Generate new refresh token
      const newRefreshToken = this.generateToken(payload, true);
      const expiresAt = new Date(
        Date.now() + parseInt(process.env.REFRESH_EXPIRATION_MS)
      );
      await this.saveToken(newRefreshToken, decodedToken.id, expiresAt);

      // Invalidate used refresh token after new one is successfully created
      if (tokenEntry) {
        tokenEntry.isValid = false;
        await tokenEntry.save();
      }

      // Set new refresh token in cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: process.env.REFRESH_MAX_AGE * 24 * 60 * 60 * 1000,
      });

      // Return new JWT
      return res.status(201).json({
        success: true,
        msg: "Token refreshed successfully",
        data: { token: newToken, refreshToken: newRefreshToken },
      });
    } catch (err) {
      // If refresh token has expired or is otherwise invalid
      if (err instanceof jwt.TokenExpiredError) {
        return res
          .status(403)
          .json({ success: false, msg: "Refresh token expired" });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res
          .status(403)
          .json({ success: false, msg: "Invalid refresh token" });
      }

      // Any other error
      console.log("Error refreshing token:", err);
      throw new Error("Error refreshing token");
    }
  };

  // Generate new token
  generateToken = (payload, isRefreshToken = false) => {
    if (isRefreshToken) {
      return jwt.sign(payload, process.env.REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_EXPIRATION,
      });
    } else {
      return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
      });
    }
  };

  // Save refresh token in database
  saveToken = async (token, userId, expiresAt, isValid = true) => {
    try {
      await this.refreshTokenModel.create({
        token,
        userId,
        expiresAt,
        isValid,
      });
    } catch (err) {
      console.log("Error saving refresh token:", err);
      throw new Error("Error saving refresh token");
    }
  };
}

module.exports = AuthController;
