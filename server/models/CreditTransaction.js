const mongoose = require("mongoose");

const creditTransactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["earned", "spent"],
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        studySession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudySession",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CreditTransaction",
    creditTransactionSchema
);