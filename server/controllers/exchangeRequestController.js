const ExchangeRequest = require("../models/ExchangeRequest");
const User = require("../models/User");

// Send exchange request
const sendExchangeRequest = async (req, res) => {
    try {
        const {
            receiverId,
            skill,
            message
        } = req.body;

        // Validate required fields
        if (!receiverId || !skill) {
            return res.status(400).json({
                success: false,
                message: "Receiver and skill are required"
            });
        }

        // Cannot send request to yourself
        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a request to yourself"
            });
        }

        // Check receiver exists
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Check whether receiver teaches this skill
        const teachesSkill = receiver.skillsToTeach.some(
            (studentSkill) =>
                studentSkill.toLowerCase() ===
                skill.trim().toLowerCase()
        );

        if (!teachesSkill) {
            return res.status(400).json({
                success: false,
                message: "This student does not teach this skill"
            });
        }

        // Check for existing pending request
        const existingRequest = await ExchangeRequest.findOne({
            sender: req.user._id,
            receiver: receiverId,
            skill: {
                $regex: new RegExp(
                    `^${skill.trim()}$`,
                    "i"
                )
            },
            status: "pending"
        });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: "You already have a pending request for this skill"
            });
        }

        // Create request
        const request = await ExchangeRequest.create({
            sender: req.user._id,
            receiver: receiverId,
            skill: skill.trim(),
            message: message?.trim() || ""
        });

        res.status(201).json({
            success: true,
            message: "Exchange request sent successfully",
            request
        });

    } catch (error) {
        console.error(
            "Send exchange request error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to send exchange request"
        });
    }
};

// Get my exchange requests
const getMyExchangeRequests = async (req, res) => {
    try {
        const incoming = await ExchangeRequest.find({
            receiver: req.user._id
        })
            .populate(
                "sender",
                "name profileImage role skillsToTeach skillsToLearn"
            )
            .sort({ createdAt: -1 });

        const outgoing = await ExchangeRequest.find({
            sender: req.user._id
        })
            .populate(
                "receiver",
                "name profileImage role skillsToTeach skillsToLearn"
            )
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            incoming,
            outgoing
        });

    } catch (error) {
        console.error(
            "Get exchange requests error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch exchange requests"
        });
    }
};

// Accept or reject exchange request
const updateExchangeRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be accepted or rejected"
            });
        }

        // Find request belonging to the current user
        const request = await ExchangeRequest.findOne({
            _id: req.params.id,
            receiver: req.user._id
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Exchange request not found"
            });
        }

        // Only pending requests can be updated
        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This request has already been processed"
            });
        }

        // Update status
        request.status = status;

        await request.save();

        res.json({
            success: true,
            message: `Exchange request ${status} successfully`,
            request
        });

    } catch (error) {
        console.error(
            "Update exchange request status error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update exchange request"
        });
    }
};

module.exports = {
    sendExchangeRequest,
    getMyExchangeRequests,
    updateExchangeRequestStatus
};