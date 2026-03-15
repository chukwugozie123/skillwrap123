const db = require("../modules/db");
const bcrypt = require("bcrypt");
const sendEmail = require("../config/mailer");

exports.sendOtpVerificationEmail = async (req, res) => {
  try {
    console.log("📩 sendOtpVerificationEmail route triggered");

    const { email } = req.body;
    console.log("📨 Email received:", email);

    if (!email) {
      console.log("❌ No email provided");
      return res.status(400).json({ error: "Email required" });
    }

    // Find user
    const userRes = await db.query(
      `SELECT id, email_verified, fullname FROM users WHERE email = $1`,
      [email]
    );

    console.log("👤 DB user result:", userRes.rows);

    if (!userRes.rows.length) {
      console.log("❌ User not found in DB");
      return res.status(404).json({ error: "User not found" });
    }

    if (userRes.rows[0].email_verified) {
      console.log("⚠️ Email already verified");
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("🔢 Generated OTP:", otp);

    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 60 * 60 * 1000;

    console.log("🔒 OTP hashed");
    console.log("⏰ Expiry timestamp:", expiresAt);

    // Save OTP
    await db.query(
      `
      UPDATE users
      SET otp_hash = $1,
          otp_expires_at = $2
      WHERE email = $3
      `,
      [hashedOtp, expiresAt, email]
    );

    console.log("💾 OTP saved to database");

    console.log("📤 Attempting to send email...");

    const result = await sendEmail({
      to: email,
      subject: "Verify Your Skillwrap Email Address",
      text: `Hello ${userRes.rows[0].fullname || "User"}, your OTP is ${otp}`,
      html: `<h2>Your SkillWrap OTP</h2><h1>${otp}</h1>`
    });

    console.log("✅ Email send result:", result);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    console.error("🔥 ERROR sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.resendEmailOtp = async (req, res) => {
  try {
    console.log("🔁 resendEmailOtp route triggered");

    const { email } = req.body;
    console.log("📨 Email received:", email);

    if (!email) {
      console.log("❌ No email provided");
      return res.status(400).json({ error: "Email required" });
    }

    const userRes = await db.query(
      `SELECT email_verified, fullname FROM users WHERE email = $1`,
      [email]
    );

    console.log("👤 DB query result:", userRes.rows);

    if (!userRes.rows.length) {
      console.log("❌ User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    if (userRes.rows[0].email_verified) {
      console.log("⚠️ Email already verified");
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("🔢 Generated OTP:", otp);

    const hashedOtp = await bcrypt.hash(otp, 10);
    console.log("🔒 OTP hashed successfully");

    const expiresAt = Date.now() + 60 * 60 * 1000;
    console.log("⏰ OTP expires at:", expiresAt);

    await db.query(
      `
      UPDATE users
      SET otp_hash = $1,
          otp_expires_at = $2
      WHERE email = $3
      `,
      [hashedOtp, expiresAt, email]
    );

    console.log("💾 OTP updated in database");

    console.log("📤 Sending resend OTP email...");

    const emailResponse = await sendEmail({
      to: email,
      subject: "Resend OTP - Skillwrap Email Verification",
      text: `Hello ${userRes.rows[0].fullname || "User"}, Your new OTP is ${otp}`,
      html: `
        <div style="font-family:sans-serif; line-height:1.6;">
          <h2>Email Verification - Resend OTP</h2>
          <p>Hello <strong>${userRes.rows[0].fullname || "User"}</strong>,</p>
          <p>Your new OTP:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 1 hour.</p>
        </div>
      `
    });

    console.log("📬 Email response from provider:", emailResponse);

    res.json({ success: true, message: "OTP resent successfully" });

  } catch (err) {
    console.error("🔥 ERROR in resendEmailOtp:", err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};




// ================= VERIFY OTP =================
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const result = await db.query(
      `
      SELECT otp_hash, otp_expires_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: "User not found" });
    }

    const { otp_hash, otp_expires_at } = result.rows[0];

    if (!otp_hash || otp_expires_at < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, otp_hash);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await db.query(
      `
      UPDATE users
      SET email_verified = true,
          otp_hash = NULL,
          otp_expires_at = NULL
      WHERE email = $1
      `,
      [email]
    );

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
};




// const db = require("../modules/db");
// const bcrypt = require("bcrypt");
// const sendEmail = require("../config/mailer"); //
// // const transporter = require("../config/mailer");


// // ================= SEND OTP =================
// exports.sendOtpVerificationEmail = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email required" });
//     }

//     // 🔍 Find user by email
//     const userRes = await db.query(
//       `SELECT id, email_verified, fullname FROM users WHERE email = $1`,
//       [email]
//     );

//     if (!userRes.rows.length) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (userRes.rows[0].email_verified) {
//       return res.status(400).json({ error: "Email already verified" });
//     }

//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

//     await db.query(
//       `
//       UPDATE users
//       SET otp_hash = $1,
//           otp_expires_at = $2
//       WHERE email = $3
//       `,
//       [hashedOtp, expiresAt, email]
//     );

//     // ✉️ Send OTP via SendGrid
//     await sendEmail({
//       to: email,
//       subject: "Verify Your Skillwrap Email Address",
//       text: `Hello ${userRes.rows[0].fullname || "User"},\n\nYour OTP for Skillwrap email verification is ${otp}. It expires in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nThank you for joining Skillwrap!`,
//       html: `
//         <div style="font-family: sans-serif; line-height: 1.6;">
//           <h2 style="color:#1d4ed8;">Email Verification</h2>
//           <p>Hello <strong>${userRes.rows[0].fullname || "User"}</strong>,</p>
//           <p>Welcome to <strong>Skillwrap</strong>! Please use the OTP below to verify your email address:</p>
//           <h1 style="color:#2563eb; font-size: 2rem;">${otp}</h1>
//           <p>This code will expire in <strong>1 hour</strong>.</p>
//           <p>If you did not request this email, you can safely ignore it.</p>
//           <p>Thank you for joining Skillwrap. We’re excited to have you on board!</p>
//         </div>
//       `,
//     });

//     res.json({ success: true, message: "OTP sent to email" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// };

// // ================= VERIFY OTP =================
// exports.verifyEmailOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ error: "Email and OTP are required" });
//     }

//     const result = await db.query(
//       `
//       SELECT otp_hash, otp_expires_at
//       FROM users
//       WHERE email = $1
//       `,
//       [email]
//     );

//     if (!result.rows.length) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     const { otp_hash, otp_expires_at } = result.rows[0];

//     if (!otp_hash || otp_expires_at < Date.now()) {
//       return res.status(400).json({ error: "OTP expired" });
//     }

//     const isValid = await bcrypt.compare(otp, otp_hash);

//     if (!isValid) {
//       return res.status(400).json({ error: "Invalid OTP" });
//     }

//     await db.query(
//       `
//       UPDATE users
//       SET email_verified = true,
//           otp_hash = NULL,
//           otp_expires_at = NULL
//       WHERE email = $1
//       `,
//       [email]
//     );

//     res.json({ success: true, message: "Email verified successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// };

// // ================= RESEND OTP =================
// exports.resendEmailOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email required" });
//     }

//     const userRes = await db.query(
//       `SELECT email_verified, fullname FROM users WHERE email = $1`,
//       [email]
//     );

//     if (!userRes.rows.length) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (userRes.rows[0].email_verified) {
//       return res.status(400).json({ error: "Email already verified" });
//     }

//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     const expiresAt = Date.now() + 60 * 60 * 1000;

//     await db.query(
//       `
//       UPDATE users
//       SET otp_hash = $1,
//           otp_expires_at = $2
//       WHERE email = $3
//       `,
//       [hashedOtp, expiresAt, email]
//     );

//     await sendEmail({
//       to: email,
//       subject: "Resend OTP - Skillwrap Email Verification",
//       text: `Hello ${userRes.rows[0].fullname || "User"},\n\nYour new OTP is ${otp}. It expires in 1 hour.\n\nThank you for being part of Skillwrap!`,
//       html: `
//         <div style="font-family:sans-serif; line-height:1.6;">
//           <h2 style="color:#1d4ed8;">Email Verification - Resend OTP</h2>
//           <p>Hello <strong>${userRes.rows[0].fullname || "User"}</strong>,</p>
//           <p>As requested, here is your new OTP to verify your email:</p>
//           <h1 style="color:#2563eb; font-size:2rem;">${otp}</h1>
//           <p>This OTP expires in <strong>1 hour</strong>.</p>
//           <p>If you did not request this, please ignore this email.</p>
//           <p>Thank you for being part of <strong>Skillwrap</strong>!</p>
//         </div>
//       `,
//     });

//     res.json({ success: true, message: "OTP resent successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to resend OTP" });
//   }
// };



exports.setMode = async (req, res) => {
  try {
    const { mode } = req.body;
    const id = req.user?.id;

    if (!id) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const result = await db.query(
      "UPDATE users SET mode = $1 WHERE id = $2 RETURNING mode",
      [mode, id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: "Failed to add mode",
      });
    }

    return res.status(200).json({
      success: true,
      mode: result.rows[0].mode,
      // console.log("sixxwaadullr ssws mosw ")
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to add mode...",
    });
  }
};


























// exports.sendOtpVerificationEmail = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email required" });
//     }

//     // 🔍 Find user by email
//     const userRes = await db.query(
//       `SELECT id, email_verified FROM users WHERE email = $1`,
//       [email]
//     );

//     if (!userRes.rows.length) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (userRes.rows[0].email_verified) {
//       return res.status(400).json({ error: "Email already verified" });
//     }

//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

//     await db.query(
//       `
//       UPDATE users
//       SET otp_hash = $1,
//           otp_expires_at = $2
//       WHERE email = $3
//       `,
//       [hashedOtp, expiresAt, email]
//     );

//     await transporter.sendMail({
//       from: `"Skillwrap" <${process.env.AUTH_EMAIL}>`,
//       to: email,
//       subject: "Verify your email",
//       html: `
//         <h2>Email Verification</h2>
//         <p>Your OTP code is:</p>
//         <h1>${otp}</h1>
//         <p>This code expires in 1 hour.</p>
//       `,
//     });

//     res.json({ success: true, message: "OTP sent to email" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// };

// exports.verifyEmailOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ error: "Email and OTP are required" });
//     }

//     const result = await db.query(
//       `
//       SELECT otp_hash, otp_expires_at
//       FROM users
//       WHERE email = $1
//       `,
//       [email]
//     );

//     if (!result.rows.length) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     const { otp_hash, otp_expires_at } = result.rows[0];

//     if (!otp_hash || otp_expires_at < Date.now()) {
//       return res.status(400).json({ error: "OTP expired" });
//     }

//     const isValid = await bcrypt.compare(otp, otp_hash);

//     if (!isValid) {
//       return res.status(400).json({ error: "Invalid OTP" });
//     }

//     await db.query(
//       `
//       UPDATE users
//       SET email_verified = true,
//           otp_hash = NULL,
//           otp_expires_at = NULL
//       WHERE email = $1
//       `,
//       [email]
//     );

//     res.json({ success: true, message: "Email verified successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// };


// exports.resendEmailOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email required" });
//     }

//     const userRes = await db.query(
//       `SELECT email_verified FROM users WHERE email = $1`,
//       [email]
//     );

//     if (!userRes.rows.length) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     if (userRes.rows[0].email_verified) {
//       return res.status(400).json({ error: "Email already verified" });
//     }

//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     const expiresAt = Date.now() + 60 * 60 * 1000;

//     await db.query(
//       `
//       UPDATE users
//       SET otp_hash = $1,
//           otp_expires_at = $2
//       WHERE email = $3
//       `,
//       [hashedOtp, expiresAt, email]
//     );

//     await transporter.sendMail({
//       from: `"Skillwrap" <${process.env.AUTH_EMAIL}>`,
//       to: email,
//       subject: "Resend OTP - Skillwrap",
//       html: `
//         <h2>Email Verification</h2>
//         <p>Your new OTP code is:</p>
//         <h1>${otp}</h1>
//         <p>This code expires in 1 hour.</p>
//       `,
//     });

//     res.json({ success: true, message: "OTP resent successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to resend OTP" });
//   }
// };
