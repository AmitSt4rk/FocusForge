const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
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

        tutorRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TutorRequest",
            required: true,
            unique: true
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

        credits: {
            type: Number,
            required: true,
            min: 1
        },

        scheduledAt: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "confirmed",
                "completed",
                "cancelled"
            ],
            default: "confirmed"
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Booking",
    bookingSchema
);