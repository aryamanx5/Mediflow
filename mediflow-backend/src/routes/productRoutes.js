const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { requireAccount } = require("../middleware/authMiddleware");


// Check if this file is being loaded
console.log("✅ productRoutes loaded");

// Create Product
router.post("/", requireAccount, createProduct);

// Get All Products
router.get("/", getAllProducts);

// Get Product By ID
router.get("/:id", getProductById);

// Update Product
router.put("/:id", (req, res, next) => {
  console.log("✅ PUT route hit");
  next();
}, requireAccount, updateProduct);

// Delete Product
router.delete("/:id", requireAccount, deleteProduct);

module.exports = router;