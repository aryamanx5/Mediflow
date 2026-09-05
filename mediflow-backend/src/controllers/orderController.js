const mongoose = require("mongoose");

const Order = require("../models/order");
const Customer = require("../models/customer");
const Product = require("../models/product");

const {
  generateOrderNumber,
  calculateOrder,
} = require("../utils/orderUtils");

// Create Order
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      customerId,
      items,
      paymentMethod,
      discount = 0,
      shippingCharge = 0,
    } = req.body;

    // Customer Validation
    const customer = await Customer.findById(customerId).session(session);

    if (!customer) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Please add at least one product",
      });
    }

    const orderItems = [];

    // Validate Products
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();

        return res.status(404).json({
          success: false,
          message: `Product not found`,
        });
      }

      if (product.stockQuantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: `${product.productName} is out of stock`,
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.sellingPrice,
      });

      // Reduce Stock
      product.stockQuantity -= item.quantity;

      await product.save({ session });
    }

    // Calculate Bill
    const totals = calculateOrder(
      orderItems,
      discount,
      shippingCharge
    );

    // Generate Order Number
    const orderNumber = generateOrderNumber();

    // Create Order
    const order = await Order.create(
      [
        {
          orderNumber,
          customer: customer._id,
          items: orderItems,

          subtotal: totals.subtotal,
          gst: totals.gst,
          discount,
          shippingCharge,
          totalAmount: totals.totalAmount,

          paymentMethod,
          paymentStatus: "Pending",
          orderStatus: "Pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      id: order[0]._id,
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const {
      search,
      orderStatus,
      paymentStatus,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filters
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    let orders = await Order.find(query)
      .populate("customer", "customerName phoneNumber customerId")
      .populate("items.product", "productName sku")
      .sort({ createdAt: -1 });

    // Search
    if (search) {
      const keyword = search.toLowerCase();

      orders = orders.filter((order) => {
        const orderNumber = order.orderNumber?.toLowerCase() || "";
        const customerName =
          order.customer?.customerName?.toLowerCase() || "";
        const phone = order.customer?.phoneNumber || "";

        return (
          orderNumber.includes(keyword) ||
          customerName.includes(keyword) ||
          phone.includes(keyword)
        );
      });
    }

    // Pagination
    const total = orders.length;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);

    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      count: paginatedOrders.length,
      data: paginatedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Order By ID
const getOrderById = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Cancel Order
const cancelOrder = async (req, res) => {

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {

      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });

    }

    if (order.orderStatus === "Cancelled") {

      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });

    }

    // Restore Stock
    for (const item of order.items) {

      const product = await Product.findById(item.product).session(session);

      if (product) {

        product.stockQuantity += item.quantity;

        await product.save({ session });

      }

    }

    order.orderStatus = "Cancelled";

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
};