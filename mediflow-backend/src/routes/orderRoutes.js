const express = require("express");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const { requireAccount } = require("../middleware/authMiddleware");


// Create Order
router.post("/", requireAccount, createOrder);

// Get All Orders
router.get("/", getAllOrders);

// Get Order By ID
router.get("/:id", getOrderById);

// Cancel Order
router.put("/cancel/:id", requireAccount, cancelOrder);

module.exports = router;