const passport = require('passport');
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const {ensureAuth} = require("../middleware/auth");
const { route } = require('./skillRoutes');

const API_URL = 'https://skillwrap2026.vercel.app'

// Routes
router.get("/signup", authController.authSignup);
router.get("/login", authController.authLogin);   
router.post("/signup", authController.authSignup);  
router.post("/login",   authController.authLogin)
router.get(
  "/google", 
  passport.authenticate("google", {
  scope: ["profile", "email"], 
  prompt:"select_account"
  })
);



router.get(
  "/google/profile",
  passport.authenticate("google", {
    failureRedirect: `${API_URL}/login`,
  }),
  (req, res) => {
    // ✅ user is authenticated here
    res.redirect(`${API_URL}/dashboard`);
  }
);

router.get("/dashboard", ensureAuth, authController.dashboard);
router.post("/logout",ensureAuth, authController.logout)
router.get("/profile", authController.profile);
router.patch("/edit-profile", authController.edit_profile)
// router.post("/login", bookController.AuthLogin);

module.exports = router;