const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const { ensureAuth } = require("../middleware/auth");

/**
 * Get chat history
 */
router.get(
  "/exchange/:exchange_id/messages",
  ensureAuth,
  chatController.getMessages
);

/**
 * Save new message
 */
router.post(
  "/exchange/:exchange_id/messages",
  ensureAuth,
  chatController.createMessage
);

module.exports = router;
