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
            enum: ["active", "completed", "cancelled"],
            default: "active"
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