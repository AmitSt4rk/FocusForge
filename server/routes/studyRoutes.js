const express = require("express");

const {
    startStudySession,
    completeStudySession,
    cancelStudySession,
    getStudySessions
} = require("../controllers/studyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/start",
    protect,
    startStudySession
);

router.post(
    "/complete/:id",
    protect,
    completeStudySession
);

router.post(
    "/cancel/:id", 
    protect, 
    cancelStudySession
);

router.get(
    "/",
    protect,
    getStudySessions
);

module.exports = router;