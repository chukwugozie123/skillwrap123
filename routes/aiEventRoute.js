const express = require("express");
const router = express.Router();
const aieventController = require("../controller/aiEventController");
const {ensureAuth} = require("../middleware/auth");

router.post("/events/:id/generate-ai", aieventController.generateEventAI);


module.exports = router