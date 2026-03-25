const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET || "supersecretjwtkey",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m"
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.REFRESH_TOKEN_SECRET || "supersecretrefreshkey",
    {
      expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7}d`
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};