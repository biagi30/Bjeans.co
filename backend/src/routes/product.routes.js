const express = require("express");
const {
	createProduct,
	deleteProduct,
	getProductById,
	listProducts,
	updateProduct
} = require("../controllers/product.controller");
const { productCreateSchema, productUpdateSchema, validateBody, validateParams } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", listProducts);
router.post("/", validateBody(productCreateSchema), createProduct);
router.get("/:id", validateParams(), getProductById);
router.patch("/:id", validateParams(), validateBody(productUpdateSchema), updateProduct);
router.delete("/:id", validateParams(), deleteProduct);

module.exports = router;
