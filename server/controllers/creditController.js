const CreditTransaction = require("../models/CreditTransaction");

const getCreditHistory = async (req, res) => {
    try {
        const transactions = await CreditTransaction.find({
            user: req.user._id
        })
            .populate("studySession", "subject duration startTime")
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            balance: req.user.focusCredits,
            transactions
        });

    } catch (error) {
        console.error(
            "Get credit history error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch credit history."
        });
    }
};

module.exports = {
    getCreditHistory
};