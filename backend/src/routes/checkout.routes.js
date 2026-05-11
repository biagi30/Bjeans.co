const express = require("express");
const { checkoutCart } = require("../controllers/checkout.controller");
const { checkoutSchema, validateBody } = require("../middlewares/validate.middleware");

const router = express.Router();

router.post("/", validateBody(checkoutSchema), checkoutCart);

module.exports = router;