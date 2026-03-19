const User = require("../models/User");
const { generateTokens, verifyRefreshToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already registered", 409);

  const user = await User.create({ name, email, password });

  const tokens = generateTokens({ id: user._id, role: user.role });

  // Persist refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: sanitize(user), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) throw new AppError("Account is disabled", 403);

  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: sanitize(user), ...tokens };
};

const refresh = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    throw new AppError("Refresh token mismatch", 401);
  }

  const tokens = generateTokens({ id: user._id, role: user.role });
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return tokens;
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// Strip sensitive fields before returning user data
const sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

module.exports = { register, login, refresh, logout };
