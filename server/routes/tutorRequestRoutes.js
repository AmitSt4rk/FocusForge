const express = require("express");

const router = express.Router();

const {
    sendTutorRequest,
    getMyTutorRequests,
    updateTutorRequestStatus
} = require(
    "../controllers/tutorRequestController"
);

const protect = require("../middleware/authMiddleware");


router.get(
    "/",
    protect,
    getMyTutorRequests
);


router.post(
    "/",
    protect,
    sendTutorRequest
);


router.patch(
    "/:id/status",
    protect,
    updateTutorRequestStatus
);


module.exports = router;