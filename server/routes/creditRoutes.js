const express = require("express");

const {
    getCreditHistory
} = require("../controllers/creditController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCreditHistory);

module.exports = router;