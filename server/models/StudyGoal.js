const mongoose = require("mongoose");

const studyGoalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        dailyGoalMinutes: {
            type: Number,
            default: 60,
            min: 1
        },

        weeklyGoalMinutes: {
            type: Number,
            default: 300,
            min: 1
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "StudyGoal",
    studyGoalSchema
);