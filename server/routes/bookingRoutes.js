const express = require("express");
const router = express.Router();

const {
    createBooking,
    getMyBookings,
    cancelBooking,
    completeBooking
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");


// Get my bookings
router.get(
    "/",
    protect,
    getMyBookings
);


// Create booking
router.post(
    "/",
    protect,
    createBooking
);


router.patch(
    "/:id/cancel",
    protect,
    cancelBooking
);

router.patch(
    "/:id/complete",
    protect,
    completeBooking
);

module.exports = router;