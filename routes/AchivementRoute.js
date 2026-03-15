const express = require("express");
const router = express.Router();

const achievementController = require("../controller/AchivementController");
const { ensureAuth } = require("../middleware/auth");

// Check and award achievements
router.post(
  "/check",
  ensureAuth,
  achievementController.checkAchievements
);

module.exports = router;