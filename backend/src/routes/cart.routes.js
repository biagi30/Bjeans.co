const express = require("express");
const {
  createCart,
  deleteCart,
  getCartById,
  listCarts,
  updateCart
} = require("../controllers/cart.controller");
const { cartCreateSchema, cartUpdateSchema, validateBody, validateParams } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", listCarts);
router.post("/", validateBody(cartCreateSchema), createCart);
router.get("/:id", validateParams(), getCartById);
router.patch("/:id", validateParams(), validateBody(cartUpdateSchema), updateCart);
router.delete("/:id", validateParams(), deleteCart);

module.exports = router;
