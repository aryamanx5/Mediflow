const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  seedDemoUser,
} = require("../config/demo");

// Issues the session token. isDemo rides along so the frontend can show a
// read-only banner without an extra round trip.
const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      isDemo: Boolean(user.isDemo),
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Only plain strings reach the database (blocks {"$gt": ""} style injection)
    if (![name, email, password].every((v) => typeof v === "string" && v.trim())) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // The demo address is reserved
    if (email.toLowerCase() === DEMO_EMAIL) {
      return res.status(400).json({
        success: false,
        message: "That email address is reserved for the demo account",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create User. Role is never taken from the request: anyone could
    // otherwise sign themselves up as Admin. Promote users via an admin.
    const user = await User.create({
      name,
      email,
      password,
      role: "User",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      id: user.id,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
        success: false,
        message: error.message,
    });
}
};

// Login User
const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find User
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare Password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      isDemo: Boolean(user.isDemo),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Demo Login — no credentials needed, so a deployed instance can be tried
// out without signing up. The account is read-only (see blockDemo).
const demoLogin = async (req, res) => {
  try {
    // Seed on demand as well as on boot, in case the row was removed.
    let user = await User.findOne({ email: DEMO_EMAIL });

    if (!user) {
      user = await seedDemoUser();
    }

    if (!user) {
      return res.status(503).json({
        success: false,
        message: "Demo account is unavailable right now",
      });
    }

    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: "Signed in to the demo account",
      token,
      isDemo: true,
      readOnly: true,
      credentials: {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
};