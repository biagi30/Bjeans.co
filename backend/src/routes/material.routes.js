const express = require("express");
const {
  createMaterial,
  deleteMaterial,
  getMaterialById,
  listMaterials,
  updateMaterial
} = require("../controllers/material.controller");
const { materialCreateSchema, materialUpdateSchema, validateBody, validateParams } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", listMaterials);
router.post("/", validateBody(materialCreateSchema), createMaterial);
router.get("/:id", validateParams(), getMaterialById);
router.patch("/:id", validateParams(), validateBody(materialUpdateSchema), updateMaterial);
router.delete("/:id", validateParams(), deleteMaterial);

module.exports = router;
