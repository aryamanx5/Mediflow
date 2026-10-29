const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, requireAccount } = require("../middleware/authMiddleware");


// Create Order
router.post("/", requireAccount, createOrder);

// Get All Orders
router.get("/", protect, getAllOrders);

// Get Order By ID
router.get("/:id", protect, getOrderById);

// Cancel Order
router.put("/cancel/:id", requireAccount, cancelOrder);

module.exports = router;