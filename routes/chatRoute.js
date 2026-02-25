const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const { ensureAuth } = require("../middleware/auth");


router.get("/user/my-room", ensureAuth, chatController.GetMyRoom);
router.post("/user/set/attachment", ensureAuth, chatController.userSetAttachment);
router.get("/user/attachment/:exchange_id", ensureAuth, chatController.GetAttachment);


module.exports = router;