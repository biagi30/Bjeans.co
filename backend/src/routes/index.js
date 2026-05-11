const express = require("express");
const healthRoutes = require("./health.routes");
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const measurementProfileRoutes = require("./measurementProfile.routes");
const materialRoutes = require("./material.routes");
const customOptionRoutes = require("./customOption.routes");
const cartRoutes = require("./cart.routes");
const checkoutRoutes = require("./checkout.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/measurement-profiles", measurementProfileRoutes);
router.use("/materials", materialRoutes);
router.use("/custom-options", customOptionRoutes);
router.use("/carts", cartRoutes);
router.use("/checkout", checkoutRoutes);

module.exports = router;
