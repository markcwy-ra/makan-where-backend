const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // const token = req.headers["authorization"];
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Access token:", token);

  if (!token) {
    res
      .status(403)
      .json({ success: false, msg: "A token is required for authentication" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ success: false, msg: "Invalid token" });
    }

    // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //   if (err) {
    //     return res.status(403).json({ success: false, msg: "Invalid token" });
    //   }

    req.user = user;
    next();
  });
};

module.exports = verifyToken;
