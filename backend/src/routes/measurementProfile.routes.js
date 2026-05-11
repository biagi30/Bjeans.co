const express = require("express");
const {
  createMeasurementProfile,
  deleteMeasurementProfile,
  getMeasurementProfileById,
  listMeasurementProfiles,
  updateMeasurementProfile
} = require("../controllers/measurementProfile.controller");
const { measurementCreateSchema, measurementUpdateSchema, validateBody, validateParams } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", listMeasurementProfiles);
router.post("/", validateBody(measurementCreateSchema), createMeasurementProfile);
router.get("/:id", validateParams(), getMeasurementProfileById);
router.patch("/:id", validateParams(), validateBody(measurementUpdateSchema), updateMeasurementProfile);
router.delete("/:id", validateParams(), deleteMeasurementProfile);

module.exports = router;
