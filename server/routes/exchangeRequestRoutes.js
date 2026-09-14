const express = require("express");
const router = express.Router();

const {
    sendExchangeRequest,
    getMyExchangeRequests,
    updateExchangeRequestStatus
} = require("../controllers/exchangeRequestController");

const protect = require("../middleware/authMiddleware");

router.get(
    "/",
    protect,
    getMyExchangeRequests
);

router.patch(
    "/:id/status",
    protect,
    updateExchangeRequestStatus
);

router.post(
    "/",
    protect,
    sendExchangeRequest
);

module.exports = router;