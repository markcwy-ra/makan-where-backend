const jwt = require("jsonwebtoken");
const { FORBIDDEN } = require("../constants/statusCodes");
const { TOKEN_REQUIRED, INVALID_TOKEN } = require("../constants/messages");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Access token:", token);

  if (!token) {
    res.status(FORBIDDEN).json({ success: false, msg: TOKEN_REQUIRED });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(FORBIDDEN).json({ success: false, msg: INVALID_TOKEN });
    }

    req.user = user;
    next();
  });
};

module.exports = verifyToken;
