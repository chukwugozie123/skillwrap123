const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig")
const uploadController = require("../controller/uploadController")
// const {ensureAuth} = require("../middleware/auth");


router.post(
  "/upload-profile",
  // (req, res, next) => {
  //   console.log("HEADERS:", req.headers["content-type"]);
  //   next();
  // },
  upload.single("image"),
  uploadController.uploadProfile
);


// router.post("/upload-profile",ensureAuth, upload.single("image"), uploadController.uploadProfile);

module.exports = router;
