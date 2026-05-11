const asyncHandler = require("../utils/asyncHandler");
const { MeasurementProfile } = require("../models");

const listMeasurementProfiles = asyncHandler(async (req, res) => {
  const profiles = await MeasurementProfile.find().populate("user").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: profiles });
});

const getMeasurementProfileById = asyncHandler(async (req, res) => {
  const profile = await MeasurementProfile.findById(req.params.id).populate("user");

  if (!profile) {
    return res.status(404).json({ success: false, message: "Measurement profile not found" });
  }

  res.status(200).json({ success: true, data: profile });
});

const createMeasurementProfile = asyncHandler(async (req, res) => {
  const profile = await MeasurementProfile.create(req.body);
  res.status(201).json({ success: true, data: profile });
});

const updateMeasurementProfile = asyncHandler(async (req, res) => {
  const profile = await MeasurementProfile.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("user");

  if (!profile) {
    return res.status(404).json({ success: false, message: "Measurement profile not found" });
  }

  res.status(200).json({ success: true, data: profile });
});

const deleteMeasurementProfile = asyncHandler(async (req, res) => {
  const profile = await MeasurementProfile.findByIdAndDelete(req.params.id);

  if (!profile) {
    return res.status(404).json({ success: false, message: "Measurement profile not found" });
  }

  res.status(200).json({ success: true, message: "Measurement profile deleted" });
});

module.exports = {
  listMeasurementProfiles,
  getMeasurementProfileById,
  createMeasurementProfile,
  updateMeasurementProfile,
  deleteMeasurementProfile
};
