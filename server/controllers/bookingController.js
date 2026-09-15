const Booking = require("../models/Booking");
const TutorRequest = require("../models/TutorRequest");
const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");

// Create booking from an accepted tutor request
const createBooking = async (req, res) => {
    try {
        const {
            tutorRequestId,
            scheduledAt,
            notes
        } = req.body;

        if (!tutorRequestId || !scheduledAt) {
            return res.status(400).json({
                success: false,
                message:
                    "Tutor request and scheduled time are required"
            });
        }

        const request = await TutorRequest.findOne({
            _id: tutorRequestId,
            student: req.user._id
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Tutor request not found"
            });
        }

        if (request.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message:
                    "Only accepted tutor requests can be booked"
            });
        }

        const bookingAlreadyExists =
            await Booking.findOne({
                tutorRequest: request._id
            });

        if (bookingAlreadyExists) {
            return res.status(409).json({
                success: false,
                message:
                    "A booking already exists for this tutor request"
            });
        }

        const bookingDate = new Date(scheduledAt);

        if (Number.isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheduled date"
            });
        }

        if (bookingDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message:
                    "Booking time must be in the future"
            });
        }

        const student =
            await User.findById(req.user._id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        if (
            student.focusCredits <
            request.creditsRequired
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Insufficient Focus Credits. You need ${request.creditsRequired} credits.`
            });
        }

        const booking = await Booking.create({
            student: request.student,
            tutor: request.tutor,
            tutorProfile: request.tutorProfile,
            tutorRequest: request._id,
            subject: request.subject,
            duration: request.duration,
            credits: request.creditsRequired,
            scheduledAt: bookingDate,
            notes: notes?.trim() || ""
        });

        // Deduct credits from student
        student.focusCredits -=
            request.creditsRequired;

        await student.save();

        // Add credits to tutor
        const tutor =
            await User.findById(request.tutor);

        if (tutor) {
            tutor.focusCredits +=
                request.creditsRequired;

            await tutor.save();
        }

        // Mark request as completed
        request.status = "completed";
        await request.save();

        const populatedBooking =
            await Booking.findById(booking._id)
                .populate(
                    "student",
                    "name profileImage"
                )
                .populate(
                    "tutor",
                    "name profileImage"
                )
                .populate(
                    "tutorProfile",
                    "subjects experienceLevel hourlyCredits"
                )
                .populate(
                    "tutorRequest",
                    "subject duration creditsRequired status"
                );

        res.status(201).json({
            success: true,
            message:
                "Booking created successfully",
            booking: populatedBooking
        });

    } catch (error) {
        console.error(
            "Create booking error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create booking"
        });
    }
};


// Get my bookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            $or: [
                { student: req.user._id },
                { tutor: req.user._id }
            ]
        })
            .populate(
                "student",
                "name profileImage"
            )
            .populate(
                "tutor",
                "name profileImage"
            )
            .populate(
                "tutorProfile",
                "subjects experienceLevel hourlyCredits"
            )
            .sort({
                scheduledAt: 1
            });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error(
            "Get bookings error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch bookings"
        });
    }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            $or: [
                { student: req.user._id },
                { tutor: req.user._id }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.status !== "confirmed") {
            return res.status(400).json({
                success: false,
                message:
                    "Only confirmed bookings can be cancelled"
            });
        }

        // Find student
        const student = await User.findById(
            booking.student
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Find tutor
        const tutor = await User.findById(
            booking.tutor
        );

        if (!tutor) {
            return res.status(404).json({
                success: false,
                message: "Tutor not found"
            });
        }

        // Refund credits to student
        student.focusCredits += booking.credits;

        // Remove previously transferred credits from tutor
        tutor.focusCredits = Math.max(
            tutor.focusCredits - booking.credits,
            0
        );

        await student.save();
        await tutor.save();

        // Create refund transaction
        await CreditTransaction.create({
            user: student._id,
            type: "earned",
            amount: booking.credits,
            description:
                `Refunded ${booking.credits} credit(s) from cancelled ${booking.subject} booking`,
            studySession: null
        });

        // Create tutor reversal transaction
        await CreditTransaction.create({
            user: tutor._id,
            type: "spent",
            amount: booking.credits,
            description:
                `Returned ${booking.credits} credit(s) from cancelled ${booking.subject} booking`,
            studySession: null
        });

        // Update booking status
        booking.status = "cancelled";

        await booking.save();

        res.json({
            success: true,
            message:
                "Booking cancelled and credits refunded successfully",
            booking
        });

    } catch (error) {
        console.error(
            "Cancel booking error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to cancel booking"
        });
    }
};

// Complete a booking
const completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            $or: [
                { student: req.user._id },
                { tutor: req.user._id }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.status !== "confirmed") {
            return res.status(400).json({
                success: false,
                message:
                    "Only confirmed bookings can be completed"
            });
        }

        booking.status = "completed";

        await booking.save();

        res.json({
            success: true,
            message: "Booking completed successfully",
            booking
        });

    } catch (error) {
        console.error(
            "Complete booking error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to complete booking"
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    cancelBooking,
    completeBooking
};