const express = require("express");

const {
    startStudySession,
    pauseStudySession,
    resumeStudySession,
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
    "/pause/:id", 
    protect, 
    pauseStudySession
);

router.post(
    "/resume/:id", 
    protect, 
    resumeStudySession
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