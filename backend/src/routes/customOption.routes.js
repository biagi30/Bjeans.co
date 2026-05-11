const express = require("express");
const {
  createCustomOption,
  deleteCustomOption,
  getCustomOptionById,
  listCustomOptions,
  updateCustomOption
} = require("../controllers/customOption.controller");
const { customOptionCreateSchema, customOptionUpdateSchema, validateBody, validateParams } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", listCustomOptions);
router.post("/", validateBody(customOptionCreateSchema), createCustomOption);
router.get("/:id", validateParams(), getCustomOptionById);
router.patch("/:id", validateParams(), validateBody(customOptionUpdateSchema), updateCustomOption);
router.delete("/:id", validateParams(), deleteCustomOption);

module.exports = router;
