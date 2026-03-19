const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, "Registered successfully", result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, 200, "Logged in successfully", result);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    sendSuccess(res, 200, "Tokens refreshed", tokens);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    sendSuccess(res, 200, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    sendSuccess(res, 200, "Profile fetched", req.user);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, me };
