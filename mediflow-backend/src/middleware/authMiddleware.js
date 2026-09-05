const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { DEMO_MESSAGE, SIGN_IN_MESSAGE } = require("../config/demo");

const protect = async (req, res, next) => {
  try {
    // Check if token exists in header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "SIGN_IN_REQUIRED",
        message: SIGN_IN_MESSAGE,
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: "SIGN_IN_REQUIRED",
        message: SIGN_IN_MESSAGE,
      });
    }

    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

// Blocks anything that writes when the caller is the shared demo account.
// Always used after protect, so req.user is set.
const blockDemo = (req, res, next) => {
  if (req.user && req.user.isDemo) {
    return res.status(403).json({
      success: false,
      code: "DEMO_READ_ONLY",
      demo: true,
      message: DEMO_MESSAGE,
    });
  }

  next();
};

// Shorthand for write routes: must be signed in, and not as the demo user.
const requireAccount = [protect, blockDemo];

// Admin only access
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized, admin access only",
    });
  }
};

module.exports = { protect, adminOnly, blockDemo, requireAccount };