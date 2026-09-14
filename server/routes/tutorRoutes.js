const express = require("express");
const router = express.Router();

const {
    getMyTutorProfile,
    updateTutorProfile,
    discoverTutors,
    getTutorProfile
} = require("../controllers/tutorController");

const protect = require("../middleware/authMiddleware");


router.get(
    "/",
    protect,
    getMyTutorProfile
);


router.get(
    "/discover",
    protect,
    discoverTutors
);


router.get(
    "/profile/:id",
    protect,
    getTutorProfile
);


router.put(
    "/",
    protect,
    updateTutorProfile
);


module.exports = router;