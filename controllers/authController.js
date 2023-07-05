const BaseController = require("./baseController");
const { generateResetToken, hashToken } = require("../utils/tokenUtils");
const createTransporter = require("../config/emailConfig");
const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

//------------ IMPORT CONSTANTS ------------//
const {
  OK,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  SERVER_ERROR,
} = require("../constants/statusCodes");

const {
  MISSING_FIELDS,
  USER_EXISTS,
  USER_REGISTERED_SUCCESS,
  REFRESH_TOKEN_SAVE_ERROR,
  INVALID_CREDENTIALS,
  USER_AUTHENTICATED,
  SIGNIN_ERROR,
  NO_REFRESH_TOKEN,
  TOKEN_REFRESHED_SUCCESS,
  REFRESH_ERROR,
  REFRESH_TOKEN_EXPIRED,
  INVALID_REFRESH_TOKEN,
  PASSWORD_RESET_SUCCESS,
  PASSWORD_RESET_ERROR,
  INVALID_EXPIRED_TOKEN,
  INITIATE_PASSWORD_RESET_ERROR,
  INITIATE_PASSWORD_RESET_SUCCESS,
  SIGNOUT_SUCCESS,
  SIGNOUT_ERROR,
  USER_NOT_FOUND,
} = require("../constants/messages");

const { FROM, PASSWORD_RESET_SUBJECT } = require("../constants/email");
//------------------------------------------//

class AuthController extends BaseController {
  constructor(model, refreshTokenModel, passwordResetTokenModel) {
    super(model);
    this.refreshTokenModel = refreshTokenModel;
    this.passwordResetTokenModel = passwordResetTokenModel;
  }
  // Sign up new user
  signUp = async (req, res) => {
    const {
      email,
      password,
      username,
      photoUrl,
      country,
      countryCode,
      latitude,
      longitude,
    } = req.body;

    // Check if all fields provided
    if (
      !email ||
      !password ||
      !username ||
      !country ||
      !countryCode ||
      latitude === null ||
      longitude === null
    ) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        msg: MISSING_FIELDS,
      });
    }

    try {
      // Check if user already exists
      const existingUser = await this.model.findOne({ where: { email } });

      if (existingUser) {
        return res
          .status(BAD_REQUEST)
          .json({ success: false, msg: USER_EXISTS });
      }

      // Create new location or find existing one
      const [location, created] = await this.locationModel.findOrCreate({
        where: { name: countryCode, latitude, longitude },
        defaults: {
          name: countryCode,
          city: country,
          country: country,
          latitude: latitude,
          longitude: longitude,
        },
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = await this.model.create({
        email,
        password: hashedPassword,
        username,
        photoUrl,
        locationId: location.id,
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
      expiresAt.setMilliseconds(
        expiresAt.getMilliseconds() +
          parseInt(process.env.REFRESH_EXPIRATION_MS)
      );

      await this.saveToken(refreshToken, newUser.id, expiresAt, true);

      // Send tokens in response
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: process.env.REFRESH_MAX_AGE * 24 * 60 * 60 * 1000,
      });

      return res.status(CREATED).json({
        success: true,
        msg: USER_REGISTERED_SUCCESS,
        data: {
          token,
          refreshToken,
          username: newUser.username,
          id: newUser.id,
          email: newUser.email,
          photoUrl: newUser.photoUrl,
          locationId: newUser.locationId,
          location,
        },
      });
    } catch (err) {
      return res
        .status(SERVER_ERROR)
        .json({ success: false, msg: REFRESH_TOKEN_SAVE_ERROR });
    }
  };

  // Sign in existing user
  signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await this.model.findOne({ where: { email } });

      if (!user) {
        return res
          .status(UNAUTHORIZED)
          .json({ success: false, msg: INVALID_CREDENTIALS });
      }

      const compare = await bcrypt.compare(password, user.password);

      // If passwords don't match
      if (!compare) {
        return res
          .status(FORBIDDEN)
          .json({ success: false, msg: INVALID_CREDENTIALS });
      }

      // If passwords match
      const payload = { id: user.id, username: user.username };
      const token = this.generateToken(payload);
      const refreshToken = this.generateToken(payload, true);

      const expiresAt = new Date();
      expiresAt.setMilliseconds(
        expiresAt.getMilliseconds() +
          parseInt(process.env.REFRESH_EXPIRATION_MS)
      );

      await this.saveToken(refreshToken, user.id, expiresAt, true);

      // Send tokens in response
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: process.env.REFRESH_MAX_AGE * 24 * 60 * 60 * 1000,
      });

      // Update user's last login time
      user.lastLogin = new Date();
      await user.save();

      return res.status(OK).json({
        success: true,
        msg: USER_AUTHENTICATED,
        data: {
          token,
          refreshToken,
          username: user.username,
          id: user.id,
          email: user.email,
          photoUrl: user.photoUrl,
        },
      });
    } catch (err) {
      console.log(err);
      return res
        .status(SERVER_ERROR)
        .json({ success: false, msg: SIGNIN_ERROR });
    }
  };

  // Sign out user
  signOut = async (req, res) => {
    const refreshToken = req.headers["x-refresh-token"];
    // const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(UNAUTHORIZED)
        .json({ success: false, msg: NO_REFRESH_TOKEN });
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

      return res.status(OK).json({ success: true, msg: SIGNOUT_SUCCESS });
    } catch (err) {
      console.log("Error signing out user:", err);
      return res
        .status(SERVER_ERROR)
        .json({ success: false, msg: SIGNOUT_ERROR });
    }
  };

  // Initiate password reset
  initiatePasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
      // Find user in database
      const user = await this.model.findOne({ where: { email } });

      if (!user) {
        return res
          .status(NOT_FOUND)
          .json({ success: false, msg: USER_NOT_FOUND });
      }

      // Generate reset token
      const resetToken = generateResetToken();

      // Create transporter using createTransporter function
      const transporter = await createTransporter();

      // Construct email message
      const message = {
        from: FROM,
        to: user.email,
        subject: PASSWORD_RESET_SUBJECT,
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
        msg: INITIATE_PASSWORD_RESET_SUCCESS,
        data: resetTokenData,
      });
    } catch (err) {
      console.log("Error initiating password reset:", err);
      return res
        .status(SERVER_ERROR)
        .json({ success: false, msg: INITIATE_PASSWORD_RESET_ERROR });
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
            .status(BAD_REQUEST)
            .json({ success: false, msg: INVALID_EXPIRED_TOKEN });
        }

        // Find user in database
        user = await this.model.findByPk(tokenData.userId);

        if (!user) {
          return res
            .status(NOT_FOUND)
            .json({ success: false, msg: USER_NOT_FOUND });
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
            .status(NOT_FOUND)
            .json({ success: false, msg: USER_NOT_FOUND });
        }
      }

      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await user.update({ password: hashedPassword });

      return res.json({ success: true, msg: PASSWORD_RESET_SUCCESS });
    } catch (err) {
      console.log("Error resetting password:", err);
      return res
        .status(SERVER_ERROR)
        .json({ success: false, msg: PASSWORD_RESET_ERROR });
    }
  };

  // Refresh token
  refreshToken = async (req, res) => {
    // While testing:
    const refreshToken = req.headers["x-refresh-token"];

    // const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(UNAUTHORIZED)
        .json({ success: false, msg: NO_REFRESH_TOKEN });
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
          .status(FORBIDDEN)
          .json({ success: false, msg: INVALID_REFRESH_TOKEN });
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

      const user = await this.model.findOne({
        where: { username: decodedToken.username },
      });

      // Return new JWT
      return res.status(CREATED).json({
        success: true,
        msg: TOKEN_REFRESHED_SUCCESS,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
          username: user.username,
          id: user.id,
          email: user.email,
          photoUrl: user.photoUrl,
        },
      });
    } catch (err) {
      // If refresh token has expired or is otherwise invalid
      if (err instanceof jwt.TokenExpiredError) {
        return res
          .status(FORBIDDEN)
          .json({ success: false, msg: REFRESH_TOKEN_EXPIRED });
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res
          .status(FORBIDDEN)
          .json({ success: false, msg: INVALID_REFRESH_TOKEN });
      }

      // Any other error
      console.log("Error refreshing token:", err);
      throw new Error(REFRESH_ERROR);
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
      throw new Error(REFRESH_TOKEN_SAVE_ERROR);
    }
  };
}

module.exports = AuthController;
