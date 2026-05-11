const asyncHandler = require("../utils/asyncHandler");
const { CustomOption } = require("../models");

const listCustomOptions = asyncHandler(async (req, res) => {
  const options = await CustomOption.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: options });
});

const getCustomOptionById = asyncHandler(async (req, res) => {
  const option = await CustomOption.findById(req.params.id);

  if (!option) {
    return res.status(404).json({ success: false, message: "Custom option not found" });
  }

  res.status(200).json({ success: true, data: option });
});

const createCustomOption = asyncHandler(async (req, res) => {
  const option = await CustomOption.create(req.body);
  res.status(201).json({ success: true, data: option });
});

const updateCustomOption = asyncHandler(async (req, res) => {
  const option = await CustomOption.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!option) {
    return res.status(404).json({ success: false, message: "Custom option not found" });
  }

  res.status(200).json({ success: true, data: option });
});

const deleteCustomOption = asyncHandler(async (req, res) => {
  const option = await CustomOption.findByIdAndDelete(req.params.id);

  if (!option) {
    return res.status(404).json({ success: false, message: "Custom option not found" });
  }

  res.status(200).json({ success: true, message: "Custom option deleted" });
});

module.exports = {
  listCustomOptions,
  getCustomOptionById,
  createCustomOption,
  updateCustomOption,
  deleteCustomOption
};
