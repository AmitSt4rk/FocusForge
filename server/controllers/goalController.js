const StudyGoal = require("../models/StudyGoal");
const StudySession = require("../models/StudySession");

// Get user's study goals
const getStudyGoals = async (req, res) => {
    try {
        let goal = await StudyGoal.findOne({
            user: req.user._id
        });

        // Create default goals if user doesn't have one yet
        if (!goal) {
            goal = await StudyGoal.create({
                user: req.user._id
            });
        }

        // Start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start of tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Start of this week (Monday)
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();

        const daysSinceMonday =
            dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        weekStart.setDate(
            today.getDate() - daysSinceMonday
        );

        // Get completed study sessions for this week
        const sessions = await StudySession.find({
            user: req.user._id,
            status: "completed",
            completed: true,
            endTime: {
                $gte: weekStart,
                $lt: tomorrow
            }
        });

        // Calculate today's progress
        const dailyProgress = sessions
            .filter((session) => {
                const sessionDate =
                    new Date(session.endTime);

                return (
                    sessionDate >= today &&
                    sessionDate < tomorrow
                );
            })
            .reduce(
                (total, session) =>
                    total + session.duration,
                0
            );

        // Calculate this week's progress
        const weeklyProgress = sessions.reduce(
            (total, session) =>
                total + session.duration,
            0
        );

        res.json({
            success: true,
            goal: {
                dailyGoalMinutes:
                    goal.dailyGoalMinutes,

                weeklyGoalMinutes:
                    goal.weeklyGoalMinutes,

                dailyProgress,
                weeklyProgress
            }
        });

    } catch (error) {
        console.error(
            "Get study goals error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch study goals."
        });
    }
};

// Update user's study goals
const updateStudyGoals = async (req, res) => {
    try {
        const {
            dailyGoalMinutes,
            weeklyGoalMinutes
        } = req.body;

        if (
            dailyGoalMinutes !== undefined &&
            (!Number.isInteger(dailyGoalMinutes) ||
                dailyGoalMinutes < 1)
        ) {
            return res.status(400).json({
                success: false,
                message: "Daily goal must be a valid number of minutes."
            });
        }

        if (
            weeklyGoalMinutes !== undefined &&
            (!Number.isInteger(weeklyGoalMinutes) ||
                weeklyGoalMinutes < 1)
        ) {
            return res.status(400).json({
                success: false,
                message: "Weekly goal must be a valid number of minutes."
            });
        }

        const goal = await StudyGoal.findOneAndUpdate(
            {
                user: req.user._id
            },
            {
                $set: {
                    ...(dailyGoalMinutes !== undefined && {
                        dailyGoalMinutes
                    }),

                    ...(weeklyGoalMinutes !== undefined && {
                        weeklyGoalMinutes
                    })
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: "Study goals updated successfully.",
            goal
        });

    } catch (error) {
        console.error(
            "Update study goals error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to update study goals."
        });
    }
};


module.exports = {
    getStudyGoals,
    updateStudyGoals
};