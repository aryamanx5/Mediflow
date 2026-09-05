const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const {
  protect,
  adminOnly,
  blockDemo,
} = require("../middleware/authMiddleware");

// Current user's profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, blockDemo, updateProfile);

// Admin routes
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id", protect, adminOnly, blockDemo, updateUser);
router.delete("/:id", protect, adminOnly, blockDemo, deleteUser);

module.exports = router;