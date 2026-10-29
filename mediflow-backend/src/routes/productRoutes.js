const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, requireAccount } = require("../middleware/authMiddleware");


// Create Product
router.post("/", requireAccount, createProduct);

// Get All Products
router.get("/", protect, getAllProducts);

// Get Product By ID
router.get("/:id", protect, getProductById);

// Update Product
router.put("/:id", requireAccount, updateProduct);

// Delete Product
router.delete("/:id", requireAccount, deleteProduct);

module.exports = router;