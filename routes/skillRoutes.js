const express = require("express");
const router = express.Router();
const skillController = require("../controller/skillController")
const {ensureAuth} = require("../middleware/auth");

const upload = require("../middleware/multerConfig");

router.get("/", skillController.home)
router.get("/search", skillController.search)

router.post(
  "/create-skills",
  ensureAuth,
  upload.single("image"), // ⚠️ MUST match frontend
  skillController.createSkill
);

// router.post("/create-skill", ensureAuth, upload.single("image"), skillController.createSkill)
router.get("/skills/:id", skillController.oneskill)
router.get("/skills", skillController.getSkills);
router.get("/view-skill", skillController.viewSkill)
router.patch("/skill/:skillId/edit-skill", skillController.edit_skill);
router.delete("/skill/:skillId", skillController.delete_skill)

// router.post("/create-skill", upload.single("file"), createSkill);
// router.post("/create-skill", ensureAuth, skillController.createSkill)

module.exports = router