const express = require("express");
const {
	createOrder,
	deleteOrder,
	getOrderById,
	listSplitOrders,
	listOrders,
	updateOrder,
	updatePaymentStatus
} = require("../controllers/order.controller");
const { orderCreateSchema, orderUpdateSchema, paymentUpdateSchema, validateBody, validateParams } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", listOrders);
router.post("/", validateBody(orderCreateSchema), createOrder);
router.get("/:id/splits", validateParams(), listSplitOrders);
router.get("/:id", validateParams(), getOrderById);
router.patch("/:id", validateParams(), validateBody(orderUpdateSchema), updateOrder);
router.patch("/:id/payment", validateParams(), validateBody(paymentUpdateSchema), updatePaymentStatus);
router.delete("/:id", validateParams(), deleteOrder);

module.exports = router;
