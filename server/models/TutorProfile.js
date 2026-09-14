const mongoose = require("mongoose");

const tutorProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        subjects: {
            type: [String],
            default: []
        },

        experienceLevel: {
            type: String,
            enum: [
                "Beginner",
                "Intermediate",
                "Advanced",
                "Expert"
            ],
            default: "Intermediate"
        },

        hourlyCredits: {
            type: Number,
            min: 1,
            default: 10
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TutorProfile",
    tutorProfileSchema
);