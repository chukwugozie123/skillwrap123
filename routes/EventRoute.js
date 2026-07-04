const express = require("express");
const router = express.Router();
const eventController = require("../controller/EventController");
const {ensureAuth} = require("../middleware/auth");

router.get("/events", ensureAuth,  eventController.getEvents);
router.post("/join/event/:eventId", ensureAuth, eventController.joinEvent);
router.get("/events/:id",  eventController.getEventById);
router.post ("/create/event", ensureAuth, eventController.createEvent);
// router.post("check/event/exist", ensureAuth, eventController.checkIfUserEnteredEvent);
router.get(
"/check/event/exist",
ensureAuth,
eventController.checkIfUserEnteredEvent
);
module.exports = router