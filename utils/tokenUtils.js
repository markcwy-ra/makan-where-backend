const crypto = require("crypto");

const generateResetToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { generateResetToken, hashToken };
