const express = require("express");
const {
	createUser,
	deleteUser,
	getUserById,
	listUsers,
	updateUser
} = require("../controllers/user.controller");
const { userCreateSchema, userUpdateSchema, validateBody, validateParams } = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", listUsers);
router.post("/", validateBody(userCreateSchema), createUser);
router.get("/:id", validateParams(), getUserById);
router.patch("/:id", validateParams(), validateBody(userUpdateSchema), updateUser);
router.delete("/:id", validateParams(), deleteUser);

module.exports = router;
