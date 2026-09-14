const mongoose = require("mongoose");

const tutorRequestSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tutorProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TutorProfile",
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: Number,
            required: true,
            min: 1
        },

        creditsRequired: {
            type: Number,
            required: true,
            min: 1
        },

        message: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "cancelled",
                "completed"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TutorRequest",
    tutorRequestSchema
);