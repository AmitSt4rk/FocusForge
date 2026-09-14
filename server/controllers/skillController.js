const User = require("../models/User");

// Get my skills
const getMySkills = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "skillsToTeach skillsToLearn"
        );

        res.json({
            success: true,
            skillsToTeach: user.skillsToTeach,
            skillsToLearn: user.skillsToLearn
        });
    } catch (error) {
        console.error("Get skills error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch skills"
        });
    }
};


// Update my skills
const updateMySkills = async (req, res) => {
    try {
        const { skillsToTeach, skillsToLearn } = req.body;

        if (!Array.isArray(skillsToTeach) || !Array.isArray(skillsToLearn)) {
            return res.status(400).json({
                success: false,
                message: "Skills must be provided as arrays"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                skillsToTeach,
                skillsToLearn
            },
            {
                new: true,
                runValidators: true
            }
        ).select("skillsToTeach skillsToLearn");

        res.json({
            success: true,
            message: "Skills updated successfully",
            skillsToTeach: user.skillsToTeach,
            skillsToLearn: user.skillsToLearn
        });
    } catch (error) {
        console.error("Update skills error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update skills"
        });
    }
};

// Discover students by skill
const discoverStudents = async (req, res) => {
    try {
        const { skill } = req.query;

        if (!skill || !skill.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill is required"
            });
        }

        const searchSkill = skill.trim();

        const users = await User.find({
            _id: { $ne: req.user._id },
            skillsToTeach: {
                $regex: new RegExp(`^${searchSkill}$`, "i")
            }
        }).select(
            "name profileImage role skillsToTeach skillsToLearn"
        );

        res.json({
            success: true,
            count: users.length,
            students: users
        });

    } catch (error) {
        console.error(
            "Discover students error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to discover students"
        });
    }
};

// Get public student profile
const getStudentProfile = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select(
            "name profileImage role skillsToTeach skillsToLearn"
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error(
            "Get student profile error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch student profile"
        });
    }
};

module.exports = {
    getMySkills,
    updateMySkills,
    discoverStudents,
    getStudentProfile
};