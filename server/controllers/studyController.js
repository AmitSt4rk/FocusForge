const StudySession = require("../models/StudySession");
const User = require("../models/User");
const CreditTransaction = require("../models/CreditTransaction");


// Start a study session
const startStudySession = async (req, res) => {
    try {
        const existingSession = await StudySession.findOne({
            user: req.user._id,
            status: { $in: ["active", "paused"] }
        });

        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: "You already have an active study session."
            });
        }

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

// Pause study session
const pauseStudySession = async (req, res) => {
    try {
        const session = await StudySession.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id,
                status: "active"
            },
            {
                $set: {
                    status: "paused",
                    pausedAt: new Date()
                }
            },
            {
                new: true
            }
        );

        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Session not found or cannot be paused."
            });
        }

        res.json({
            success: true,
            message: "Study session paused successfully.",
            session
        });

    } catch (error) {
        console.error(
            "Pause study session error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to pause study session."
        });
    }
};

// Resume study session
const resumeStudySession = async (req, res) => {
    try {
        const session = await StudySession.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: "paused"
        });

        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Session not found or cannot be resumed."
            });
        }

        if (!session.pausedAt) {
            return res.status(400).json({
                success: false,
                message: "Pause time not found."
            });
        }

        const now = new Date();

        const pausedSeconds = Math.floor(
            (now.getTime() - session.pausedAt.getTime()) / 1000
        );

        session.totalPausedSeconds += pausedSeconds;
        session.pausedAt = null;
        session.status = "active";

        await session.save();

        res.json({
            success: true,
            message: "Study session resumed successfully.",
            session
        });

    } catch (error) {
        console.error(
            "Resume study session error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to resume study session."
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

        if (
            session.completed ||
            !["active", "paused"].includes(session.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Session cannot be completed."
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
                status: { $in: ["active", "paused"] }
            },
            {
                $set: {
                    endTime: new Date(),
                    status: "cancelled",
                    completed: false,
                    creditsEarned: 0,
                    pausedAt: null
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
        }).sort({ createdAt: -1 });

        const now = Date.now();

        for (const session of sessions) {
            // Only automatically complete ACTIVE sessions
            if (session.status === "active") {
                const startTime = new Date(
                    session.startTime
                ).getTime();

                const elapsedSeconds = Math.floor(
                    (now - startTime) / 1000
                );

                const activeSeconds =
                    elapsedSeconds -
                    (session.totalPausedSeconds || 0);

                const totalSeconds =
                    session.duration * 60;

                if (activeSeconds >= totalSeconds) {
                    session.endTime = new Date(
                        startTime +
                        (
                            totalSeconds +
                            (session.totalPausedSeconds || 0)
                        ) *
                        1000
                    );

                    session.status = "completed";
                    session.completed = true;
                    session.creditsEarned = session.duration;

                    await session.save();

                    await User.findByIdAndUpdate(
                        req.user._id,
                        {
                            $inc: {
                                focusCredits: session.duration
                            }
                        }
                    );

                    await CreditTransaction.create({
                        user: req.user._id,
                        type: "earned",
                        amount: session.duration,
                        description: `Earned ${session.duration} credit(s) from study session`,
                        studySession: session._id
                    });
                }
            }
        }

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
    pauseStudySession,
    resumeStudySession,
    completeStudySession,
    cancelStudySession,
    getStudySessions
};