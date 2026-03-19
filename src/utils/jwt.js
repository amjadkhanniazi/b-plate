const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Generate access + refresh token pair for a user
 */
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE,
  });

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = { generateTokens, verifyAccessToken, verifyRefreshToken };
