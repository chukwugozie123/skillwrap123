const express = require("express");
const router = express.Router();
const XpController = require("../controller/XpController");
const { ensureAuth } = require("../middleware/auth");


router.post("/update/xp", ensureAuth, XpController.InputXp);
router.post("/transactions", ensureAuth, XpController.XpTransactions);

module.exports = router;

