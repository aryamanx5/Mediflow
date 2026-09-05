const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Register User
router.post("/register", authController.register);

// Login User
router.post("/login", authController.login);

// Demo Login (no signup needed, read-only account)
router.post("/demo", authController.demoLogin);
router.get("/demo", authController.demoLogin);

module.exports = router;