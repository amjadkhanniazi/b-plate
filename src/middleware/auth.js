const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * protect — verifies JWT and attaches req.user
 * Use on any route that requires authentication.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * authorize(...roles) — role-based access control
 *
 * Usage:
 *   router.delete("/users/:id", protect, authorize("admin"), deleteUser);
 *
 * If your project doesn't need role-based auth, simply don't use this middleware.
 * It exists in the boilerplate but is opt-in per route.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized for this action`, 403)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
