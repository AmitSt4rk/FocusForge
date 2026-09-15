const TutorProfile = require("../models/TutorProfile");
const User = require("../models/User");


// Get my tutor profile
const getMyTutorProfile = async (req, res) => {
    try {
        const tutorProfile = await TutorProfile.findOne({
            user: req.user._id
        }).populate(
            "user",
            "name profileImage role"
        );

        res.json({
            success: true,
            tutorProfile
        });

    } catch (error) {
        console.error(
            "Get my tutor profile error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch tutor profile"
        });
    }
};


// Create or update tutor profile
const updateTutorProfile = async (req, res) => {
    try {
        const {
            bio,
            subjects,
            experienceLevel,
            hourlyCredits,
            isAvailable
        } = req.body;


        // Validate subjects
        if (!Array.isArray(subjects)) {
            return res.status(400).json({
                success: false,
                message: "Subjects must be provided as an array"
            });
        }


        // Validate hourly credits
        if (
            hourlyCredits === undefined ||
            Number(hourlyCredits) < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Hourly credits must be at least 1"
            });
        }


        const tutorProfile =
            await TutorProfile.findOneAndUpdate(
                {
                    user: req.user._id
                },
                {
                    user: req.user._id,
                    bio: bio?.trim() || "",
                    subjects,
                    experienceLevel,
                    hourlyCredits: Number(hourlyCredits),
                    isAvailable:
                        isAvailable !== undefined
                            ? Boolean(isAvailable)
                            : true
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            ).populate(
                "user",
                "name profileImage role"
            );


        res.json({
            success: true,
            message: "Tutor profile saved successfully",
            tutorProfile
        });

    } catch (error) {
        console.error(
            "Update tutor profile error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to save tutor profile"
        });
    }
};


// Discover tutors
const discoverTutors = async (req, res) => {
    try {
        const { subject } = req.query;

        const filter = {
            user: {
                $ne: req.user._id
            },
            isAvailable: true
        };

        // Find tutors by their Profile "skillsToTeach"
        let tutors = await TutorProfile.find(filter)
            .populate(
                "user",
                "name profileImage role skillsToTeach"
            )
            .sort({
                createdAt: -1
            });

        // Optional subject/skill filter
        if (subject && subject.trim()) {
            const searchSkill = subject.trim().toLowerCase();

            tutors = tutors.filter((tutor) =>
                tutor.user?.skillsToTeach?.some(
                    (skill) =>
                        skill.toLowerCase() === searchSkill
                )
            );
        }

        // Keep "subjects" for frontend compatibility
        tutors = tutors.map((tutor) => {
            const tutorObject = tutor.toObject();

            return {
                ...tutorObject,
                subjects: tutor.user?.skillsToTeach || []
            };
        });

        res.json({
            success: true,
            count: tutors.length,
            tutors
        });

    } catch (error) {
        console.error(
            "Discover tutors error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to discover tutors"
        });
    }
};

// Get tutor profile
const getTutorProfile = async (req, res) => {
    try {
        const tutorProfile = await TutorProfile.findOne({
            _id: req.params.id,
            isAvailable: true
        }).populate(
            "user",
            "name profileImage role skillsToTeach"
        );

        if (!tutorProfile) {
            return res.status(404).json({
                success: false,
                message: "Tutor not found"
            });
        }

        const tutorObject = tutorProfile.toObject();

        // Use Profile → I Can Teach as the source of truth
        tutorObject.subjects =
            tutorProfile.user?.skillsToTeach || [];

        res.json({
            success: true,
            tutorProfile: tutorObject
        });
    } catch (error) {
        console.error("Get tutor profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch tutor profile"
        });
    }
};

module.exports = {
    getMyTutorProfile,
    updateTutorProfile,
    discoverTutors,
    getTutorProfile
};