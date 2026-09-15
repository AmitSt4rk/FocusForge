const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const studyRoutes = require("./routes/studyRoutes");
const creditRoutes = require("./routes/creditRoutes");
const goalRoutes = require("./routes/goalRoutes");
const skillRoutes = require("./routes/skillRoutes");
const exchangeRequestRoutes = require("./routes/exchangeRequestRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const tutorRequestRoutes = require("./routes/tutorRequestRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/exchange-requests", exchangeRequestRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/tutor-requests", tutorRequestRoutes);
app.use("/api/bookings", bookingRoutes);

// Test route
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "FocusForge server is running!"
    });
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(process.env.PORT || 5000, () => {
            console.log(
                `Server running on http://localhost:${process.env.PORT || 5000}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });