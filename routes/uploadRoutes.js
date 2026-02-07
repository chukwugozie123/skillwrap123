const express = require("express");
const router = express.Router();

const upload = require("../middleware/multerConfig");
const { ensureAuth } = require("../middleware/auth");
const uploadController = require("../controller/uploadController");

router.post(
  "/upload-profile",
  ensureAuth,
  upload.single("image"),
  uploadController.uploadProfile
);

module.exports = router;


// router.post(
//   "/upload-profile",
//   // (req, res, next) => {
//   //   console.log("HEADERS:", req.headers["content-type"]);
//   //   next();
//   // },
//   upload.single("image"),
//   uploadController.uploadProfile
// );