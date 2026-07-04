const express = require("express");
const router = express.Router();
const exchangeController = require("../controller/exchangeController.js")
const {ensureAuth} = require("../middleware/auth");

router.post("/exchange-skill", ensureAuth, exchangeController.exchange)
router.post("/learn-skill", ensureAuth, exchangeController.exchange_learn)
router.post("/exchange/sent", ensureAuth, exchangeController.getSentRequests)
router.post("/exchange/recieved", ensureAuth, exchangeController.getReceivedRequests)
router.get("/stats",ensureAuth, exchangeController.getStats)
router.patch("/update-exchange-status", ensureAuth, exchangeController.updateStatus) 
router.patch("/exchange/update-status", ensureAuth,exchangeController.updateExchangeStatus) // for the exchnage status e.g completed/canclled
router.get("/exchange/:exchange_id", ensureAuth, exchangeController.getExchangeDetails);
router.delete("/delete/exchange/request", ensureAuth, exchangeController.DeleteExhanage)
router.get(
"/exchange/get/note/:exchange_id",
exchangeController.getNotes
);


router.post(
"/exchange/post/note",
exchangeController.insertNote
);


router.put(
"/exchange/put/note",
exchangeController.updateNote
);
// router.get("/user/my-room", ensureAuth, exchangeController.GetMyRoom);

module.exports = router
