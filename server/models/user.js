const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            default: null
        },

        googleId: {
            type: String,
            default: null
        },

        profileImage: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            enum: ["student", "tutor", "admin"],
            default: "student"
        },

        focusCredits: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);