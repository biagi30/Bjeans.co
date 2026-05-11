const asyncHandler = require("../utils/asyncHandler");
const { Material } = require("../models");

const listMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: materials });
});

const getMaterialById = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({ success: false, message: "Material not found" });
  }

  res.status(200).json({ success: true, data: material });
});

const createMaterial = asyncHandler(async (req, res) => {
  const material = await Material.create(req.body);
  res.status(201).json({ success: true, data: material });
});

const updateMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!material) {
    return res.status(404).json({ success: false, message: "Material not found" });
  }

  res.status(200).json({ success: true, data: material });
});

const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findByIdAndDelete(req.params.id);

  if (!material) {
    return res.status(404).json({ success: false, message: "Material not found" });
  }

  res.status(200).json({ success: true, message: "Material deleted" });
});

module.exports = {
  listMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
