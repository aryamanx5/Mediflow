const express = require("express");
const router = express.Router();

const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const { protect, requireAccount } = require("../middleware/authMiddleware");


// Create Customer
router.post("/", requireAccount, createCustomer);

// Get All Customers
router.get("/", protect, getAllCustomers);

// Get Customer By ID
router.get("/:id", protect, getCustomerById);

// Update Customer
router.put("/:id", requireAccount, updateCustomer);

// Delete Customer
router.delete("/:id", requireAccount, deleteCustomer);

module.exports = router;