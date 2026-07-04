const express = require("express");
const router = express.Router();
const ActivityRoute = require("../controller/ActivityController");
const {ensureAuth} = require("../middleware/auth");

router.post("/activity", ensureAuth,  ActivityRoute.createActivity);
router.get("/activity/get", ensureAuth, ActivityRoute.getUserActivities);

module.exports = router