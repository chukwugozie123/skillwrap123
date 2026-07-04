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

router.get("/achievement/user", ensureAuth, achievementController.getUserAchievements)
router.get("/fetch/all/achivments", ensureAuth, achievementController.getAllAchievements)

module.exports = router;