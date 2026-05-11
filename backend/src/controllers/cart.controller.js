const asyncHandler = require("../utils/asyncHandler");
const { Cart } = require("../models");

const listCarts = asyncHandler(async (req, res) => {
  const carts = await Cart.find().sort({ createdAt: -1 }).populate("user");
  res.status(200).json({ success: true, data: carts });
});

const getCartById = asyncHandler(async (req, res) => {
  const cart = await Cart.findById(req.params.id).populate("user");

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  res.status(200).json({ success: true, data: cart });
});

const createCart = asyncHandler(async (req, res) => {
  const cart = await Cart.create(req.body);
  res.status(201).json({ success: true, data: cart });
});

const updateCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("user");

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  res.status(200).json({ success: true, data: cart });
});

const deleteCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findByIdAndDelete(req.params.id);

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  res.status(200).json({ success: true, message: "Cart deleted" });
});

module.exports = {
  listCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart
};
