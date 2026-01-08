const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig")
// const cloudinary = require("../utils/cloundinary")
const uploadController = require("../controller/uploadController")
const {ensureAuth} = require("../middleware/auth");


router.post("/upload-profile",ensureAuth, upload.single("image"), uploadController.uploadProfile);

module.exports = router;
