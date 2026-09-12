const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        subject: {
            type: String,
            trim: true,
            default: "General Study"
        },

        duration: {
            type: Number,
            required: true,
            min: 1
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["active", "paused", "completed", "cancelled"],
            default: "active"
        },

        pausedAt: {
            type: Date,
            default: null
        },
        
        totalPausedSeconds: {
            type: Number,
            default: 0,
            min: 0
        },

        completed: {
            type: Boolean,
            default: false
        },

        creditsEarned: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "StudySession",
    studySessionSchema
);