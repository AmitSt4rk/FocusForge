const StudySession = require("../models/StudySession");
const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");


// Start a study session
const startStudySession = async (req, res) => {
    try {
        const { subject, duration } = req.body;

        if (!duration || duration < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid duration is required."
            });
        }

        const session = await StudySession.create({
            user: req.user._id,
            subject: subject || "General Study",
            duration,
            startTime: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Study session started.",
            session
        });

    } catch (error) {
        console.error(
            "Start study session error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to start study session."
        });
    }
};


// Complete a study session
const completeStudySession = async (req, res) => {
    try {
        const session = await StudySession.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Study session not found."
            });
        }

        if (session.completed) {
            return res.status(400).json({
                success: false,
                message: "Session already completed."
            });
        }

        // Calculate credits
        const creditsEarned = session.duration;

        // Update study session
        session.endTime = new Date();
        session.status = "completed";
        session.completed = true;
        session.creditsEarned = creditsEarned;

        await session.save();

        // Update user's credit balance
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $inc: {
                    focusCredits: creditsEarned
                }
            },
            {
                new: true
            }
        ).select("-password");

        // Create credit transaction
        const transaction = await CreditTransaction.create({
            user: req.user._id,
            type: "earned",
            amount: creditsEarned,
            description: `Earned ${creditsEarned} credit(s) from study session`,
            studySession: session._id
        });

        res.json({
            success: true,
            message: "Study session completed successfully.",
            session,
            credits: {
                earned: creditsEarned,
                balance: user.focusCredits
            },
            transaction
        });

    } catch (error) {
        console.error(
            "Complete study session error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to complete study session."
        });
    }
};

const cancelStudySession = async (req, res) => {
    try {
        const session = await StudySession.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id,
                status: "active"
            },
            {
                $set: {
                    endTime: new Date(),
                    status: "cancelled",
                    completed: false,
                    creditsEarned: 0
                }
            },
            {
                new: true
            }
        );

        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Session not found or already completed/cancelled."
            });
        }

        res.json({
            success: true,
            message: "Study session cancelled successfully.",
            session
        });
    } catch (error) {
        console.error(
            "Cancel study session error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to cancel study session."
        });
    }
};

// Get user's study sessions
const getStudySessions = async (req, res) => {
    try {
        const sessions = await StudySession.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            sessions
        });

    } catch (error) {
        console.error(
            "Get study sessions error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch study sessions."
        });
    }
};

module.exports = {
    startStudySession,
    completeStudySession,
    cancelStudySession,
    getStudySessions
};