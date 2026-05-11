const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const { Cart, Order } = require("../models");

function generateOrderNumber(prefix) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

const checkoutCart = asyncHandler(async (req, res) => {
  const { cartId, shippingAddress = "" } = req.body;

  if (!cartId) {
    return res.status(400).json({ success: false, message: "cartId is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(cartId)) {
    return res.status(400).json({ success: false, message: "cartId is invalid" });
  }

  const cart = await Cart.findById(cartId).populate("user");

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  if (!cart.items.length) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  const retailItems = cart.items.filter((item) => item.itemType === "retail");
  const customItems = cart.items.filter((item) => item.itemType === "custom");
  const computedTotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (computedTotal <= 0) {
    return res.status(400).json({ success: false, message: "Cart total is invalid" });
  }

  if (cart.totalAmount !== computedTotal) {
    cart.totalAmount = computedTotal;
    await cart.save();
  }

  const unifiedOrder = await Order.create({
    orderNumber: generateOrderNumber("UNF"),
    orderType: "unified",
    customer: cart.user,
    items: cart.items,
    status: "waiting_payment",
    paymentStatus: "unpaid",
    shippingAddress,
    totalAmount: computedTotal
  });

  const splitOrders = [];

  if (retailItems.length) {
    const retailTotal = retailItems.reduce((sum, item) => sum + item.totalPrice, 0);
    splitOrders.push(
      await Order.create({
        orderNumber: generateOrderNumber("RTL"),
        orderType: "retail",
        parentOrder: unifiedOrder._id,
        customer: cart.user,
        items: retailItems,
        status: "waiting_payment",
        paymentStatus: "unpaid",
        shippingAddress,
        totalAmount: retailTotal
      })
    );
  }

  if (customItems.length) {
    const customTotal = customItems.reduce((sum, item) => sum + item.totalPrice, 0);
    splitOrders.push(
      await Order.create({
        orderNumber: generateOrderNumber("CST"),
        orderType: "custom",
        parentOrder: unifiedOrder._id,
        customer: cart.user,
        items: customItems,
        status: "waiting_payment",
        paymentStatus: "unpaid",
        shippingAddress,
        totalAmount: customTotal
      })
    );
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(200).json({
    success: true,
    data: {
      unifiedOrder,
      splitOrders
    }
  });
});

module.exports = {
  checkoutCart
};