const express = require("express");

const {
    register,
    login,
    googleLogin,
    updateProfile
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/google", googleLogin);

router.put("/profile", protect, updateProfile);

module.exports = router;