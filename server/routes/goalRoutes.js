const express = require("express");
const router = express.Router();

const {
    getStudyGoals,
    updateStudyGoals
} = require("../controllers/goalController");

const protect = require("../middleware/authMiddleware");

// Get user's goals
router.get("/", protect, getStudyGoals);

// Update user's goals
router.put("/", protect, updateStudyGoals);

module.exports = router;