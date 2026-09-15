const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

// ===============================
// REGISTER
// ===============================

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and password"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                focusCredits: user.focusCredits
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// LOGIN

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google Login"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                focusCredits: user.focusCredits
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ===============================
// GOOGLE LOGIN
// ===============================

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required"
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const {
            sub,
            email,
            name,
            picture,
            email_verified
        } = payload;

        if (!email_verified) {
            return res.status(401).json({
                success: false,
                message: "Google email is not verified"
            });
        }

        let user = await User.findOne({
            $or: [
                { googleId: sub },
                { email: email.toLowerCase() }
            ]
        });

        if (!user) {

            user = await User.create({
                name,
                email: email.toLowerCase(),
                googleId: sub,
                profileImage: picture || "",
                role: "student"
            });

        } else if (!user.googleId) {

            user.googleId = sub;
            user.profileImage = picture || user.profileImage;

            await user.save();
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                focusCredits: user.focusCredits
            }
        });

    } catch (error) {
        console.error("Google login error:", error);

        res.status(401).json({
            success: false,
            message: "Google authentication failed"
        });
    }
};

// ===============================
// UPDATE PROFILE
// ===============================

const updateProfile = async (req, res) => {
    try {
        const { name, profileImage } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: name.trim(),
                profileImage: profileImage || ""
            },
            {
                new: true,
                runValidators: true
            }
        ).select(
            "name email role profileImage focusCredits"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                focusCredits: user.focusCredits
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};


module.exports = {
    register,
    login,
    googleLogin,
    updateProfile
};