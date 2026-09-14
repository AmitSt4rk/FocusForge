const express = require("express");
const router = express.Router();

const {
    getMySkills,
    updateMySkills,
    discoverStudents,
    getStudentProfile
} = require("../controllers/skillController");

const protect = require("../middleware/authMiddleware");


// Get my skills
router.get("/", protect, getMySkills);

router.get("/discover", protect, discoverStudents);
router.get("/profile/:id", protect, getStudentProfile);

// Update my skills
router.put("/", protect, updateMySkills);


module.exports = router;