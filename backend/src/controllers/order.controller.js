const asyncHandler = require("../utils/asyncHandler");
const { Order } = require("../models");

const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("customer");
  res.status(200).json({ success: true, data: orders });
});

const listSplitOrders = asyncHandler(async (req, res) => {
  const splits = await Order.find({ parentOrder: req.params.id })
    .sort({ createdAt: -1 })
    .populate("customer");
  res.status(200).json({ success: true, data: splits });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("customer");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({ success: true, data: order });
});

const createOrder = asyncHandler(async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json({ success: true, data: order });
});

const updateOrder = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.user && req.user.id) {
    updateData.updatedBy = req.user.id;
  } else if (req.body.updatedBy) {
    updateData.updatedBy = req.body.updatedBy;
  }

  const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate("customer");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({ success: true, data: order });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, status, updatedBy } = req.body;
  const updateData = {
    paymentStatus,
    updatedBy: null
  };

  if (req.user && req.user.id) {
    updateData.updatedBy = req.user.id;
  } else if (updatedBy) {
    updateData.updatedBy = updatedBy;
  }

  if (status) {
    updateData.status = status;
  } else if (paymentStatus === "paid") {
    updateData.status = "processing";
  }

  const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate("customer");

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({ success: true, data: order });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({ success: true, message: "Order deleted" });
});

module.exports = {
  listOrders,
  listSplitOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updatePaymentStatus,
  deleteOrder
};
