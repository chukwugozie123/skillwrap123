// const db = require("../modules/db");
// const bcrypt = require("bcrypt");
// const transporter = require("../config/mailer");

// exports.sendOtpVerificationEmail = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ error: "Email required" });
//     }

//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

//     await db.query(
//       `
//       UPDATE users
//       SET otp_hash = $1,
//           otp_expires_at = $2
//       WHERE id = $3
//       `,
//       [hashedOtp, expiresAt, userId]
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

//     res.json({
//       success: true,
//       message: "OTP sent to email",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// };



// exports.verifyEmailOtp = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { otp } = req.body;

//     if (!otp) {
//       return res.status(400).json({ error: "OTP is required" });
//     }

//     const result = await db.query(
//       `
//       SELECT otp_hash, otp_expires_at
//       FROM users
//       WHERE id = $1
//       `,
//       [userId]
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
//       WHERE id = $1
//       `,
//       [userId]
//     );

//     res.json({
//       success: true,
//       message: "Email verified successfully",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// };


// exports.resendEmailOtp = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // 🔍 Check user state
//     const userRes = await db.query(
//       `
//       SELECT email, email_verified
//       FROM users
//       WHERE id = $1
//       `,
//       [userId]
//     );

//     if (!userRes.rows.length) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const { email, email_verified } = userRes.rows[0];

//     if (email_verified) {
//       return res.status(400).json({ error: "Email already verified" });
//     }

//     // 🔐 Generate new OTP
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const hashedOtp = await bcrypt.hash(otp, 10);
//     const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

//     // 🔁 Update OTP
//     await db.query(
//       `
//       UPDATE users
//       SET otp_hash = $1,
//           otp_expires_at = $2
//       WHERE id = $3
//       `,
//       [hashedOtp, expiresAt, userId]
//     );

//     // 📧 Send email
//     await transporter.sendMail({
//       from: `"Skillwrap" <${process.env.AUTH_EMAIL}>`,
//       to: email,
//       subject: "Resend: Verify your email",
//       html: `
//         <h2>Email Verification</h2>
//         <p>Your new OTP code is:</p>
//         <h1>${otp}</h1>
//         <p>This code expires in 1 hour.</p>
//       `,
//     });

//     res.json({
//       success: true,
//       message: "OTP resent successfully",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to resend OTP" });
//   }
// };




const db = require("../modules/db");
const bcrypt = require("bcrypt");
const transporter = require("../config/mailer");


exports.sendOtpVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // 🔍 Find user by email
    const userRes = await db.query(
      `SELECT id, email_verified FROM users WHERE email = $1`,
      [email]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userRes.rows[0].email_verified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    await db.query(
      `
      UPDATE users
      SET otp_hash = $1,
          otp_expires_at = $2
      WHERE email = $3
      `,
      [hashedOtp, expiresAt, email]
    );

    await transporter.sendMail({
      from: `"Skillwrap" <${process.env.AUTH_EMAIL}>`,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 1 hour.</p>
      `,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

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


exports.resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const userRes = await db.query(
      `SELECT email_verified FROM users WHERE email = $1`,
      [email]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userRes.rows[0].email_verified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 60 * 60 * 1000;

    await db.query(
      `
      UPDATE users
      SET otp_hash = $1,
          otp_expires_at = $2
      WHERE email = $3
      `,
      [hashedOtp, expiresAt, email]
    );

    await transporter.sendMail({
      from: `"Skillwrap" <${process.env.AUTH_EMAIL}>`,
      to: email,
      subject: "Resend OTP - Skillwrap",
      html: `
        <h2>Email Verification</h2>
        <p>Your new OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 1 hour.</p>
      `,
    });

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};


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
