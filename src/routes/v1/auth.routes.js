const express = require("express");
const router = express.Router();
const { register, login, refresh, logout, me } = require("../../controllers/auth.controller");
const { protect } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { registerSchema, loginSchema, refreshSchema } = require("../../validations/auth.validation");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", protect, logout);
router.get("/me", protect, me);

module.exports = router;
