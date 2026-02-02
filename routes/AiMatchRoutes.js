const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const aiSkillMatch = require("../controller/AimatchController"); // destructure


// POST /api/ai/match-skill
router.post("/match-skill", ensureAuth, aiSkillMatch.AiSkillMatch);
router.post("/generate-roadmap", ensureAuth, aiSkillMatch.generateRoadmap);

module.exports = router;
