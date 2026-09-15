const TutorRequest = require("../models/TutorRequest");
const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");

// Send tutor request
const sendTutorRequest = async (req, res) => {
    try {
        const {
            tutorProfileId,
            subject,
            duration,
            message
        } = req.body;

        if (
            !tutorProfileId ||
            !subject ||
            !duration
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Tutor, subject and duration are required"
            });
        }

        const requestedDuration =
            Number(duration);

        if (
            !Number.isInteger(requestedDuration) ||
            requestedDuration < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Duration must be at least 1 hour"
            });
        }

        const tutorProfile =
            await TutorProfile.findById(
                tutorProfileId
            );

        if (!tutorProfile) {
            return res.status(404).json({
                success: false,
                message: "Tutor profile not found"
            });
        }

        if (!tutorProfile.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Tutor is currently unavailable"
            });
        }

        if (
            tutorProfile.user.toString() ===
            req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot request yourself as a tutor"
            });
        }

        const tutorUser = await User.findById(
            tutorProfile.user
        ).select("skillsToTeach");

        if (!tutorUser) {
            return res.status(404).json({
                success: false,
                message: "Tutor user not found"
            });
        }

        const teachesSubject =
            tutorUser.skillsToTeach.some(
                (item) =>
                    item.toLowerCase() ===
                    subject.trim().toLowerCase()
            );

        if (!teachesSubject) {
            return res.status(400).json({
                success: false,
                message:
                    "Tutor does not teach this subject"
            });
        }

        const existingRequest =
            await TutorRequest.findOne({
                student: req.user._id,
                tutor: tutorProfile.user,
                subject: {
                    $regex: new RegExp(
                        `^${subject.trim()}$`,
                        "i"
                    )
                },
                status: "pending"
            });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have a pending request for this subject"
            });
        }

        const creditsRequired =
            tutorProfile.hourlyCredits *
            requestedDuration;

        const student =
            await User.findById(req.user._id);

        if (
            student.focusCredits <
            creditsRequired
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Insufficient Focus Credits. You need ${creditsRequired} credits.`
            });
        }

        const request =
            await TutorRequest.create({
                student: req.user._id,
                tutor: tutorProfile.user,
                tutorProfile: tutorProfile._id,
                subject: subject.trim(),
                duration: requestedDuration,
                creditsRequired,
                message:
                    message?.trim() || ""
            });

        res.status(201).json({
            success: true,
            message:
                "Tutor request sent successfully",
            request
        });

    } catch (error) {
        console.error(
            "Send tutor request error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to send tutor request"
        });
    }
};


// Get my tutor requests
const getMyTutorRequests = async (req, res) => {
    try {
        const incoming =
            await TutorRequest.find({
                tutor: req.user._id
            })
                .populate(
                    "student",
                    "name profileImage role"
                )
                .populate(
                    "tutorProfile",
                    "subjects experienceLevel hourlyCredits"
                )
                .sort({
                    createdAt: -1
                });

        const outgoing =
            await TutorRequest.find({
                student: req.user._id
            })
                .populate(
                    "tutor",
                    "name profileImage role"
                )
                .populate(
                    "tutorProfile",
                    "subjects experienceLevel hourlyCredits"
                )
                .sort({
                    createdAt: -1
                });

        res.json({
            success: true,
            incoming,
            outgoing
        });

    } catch (error) {
        console.error(
            "Get tutor requests error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch tutor requests"
        });
    }
};


// Accept or reject tutor request
const updateTutorRequestStatus = async (
    req,
    res
) => {
    try {
        const { status } = req.body;

        if (
            !["accepted", "rejected"].includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be accepted or rejected"
            });
        }

        const request =
            await TutorRequest.findOne({
                _id: req.params.id,
                tutor: req.user._id
            });

        if (!request) {
            return res.status(404).json({
                success: false,
                message:
                    "Tutor request not found"
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message:
                    "This request has already been processed"
            });
        }

        request.status = status;

        await request.save();

        res.json({
            success: true,
            message:
                `Tutor request ${status} successfully`,
            request
        });

    } catch (error) {
        console.error(
            "Update tutor request status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update tutor request"
        });
    }
};


module.exports = {
    sendTutorRequest,
    getMyTutorRequests,
    updateTutorRequestStatus
};