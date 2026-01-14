const express = require("express");
const router = express.Router();
const verifyController = require("../controller/verifyemailController");
const { ensureAuth } = require("../middleware/auth");


// Send OTP (initial)
router.post(
  "/send-verification-otp",
  verifyController.sendOtpVerificationEmail
);

// Verify OTP
router.post(
  "/verify-email-otp",
    verifyController.verifyEmailOtp
);

// Resend OTP
router.post(
  "/resend-email-otp",
verifyController.resendEmailOtp
);

router.post(
    "/user/set-mode",
    ensureAuth,
    verifyController.setMode
)
module.exports = router;







// email_verified BOOLEAN DEFAULT false,
// otp_hash TEXT,
// otp_expires_at BIGINT
