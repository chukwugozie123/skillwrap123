// const db = require("../modules/db");
// const bcrypt = require("bcrypt");


// exports.sendOtpVerificationEmail = async ({}, req, res) => {
//     try {
//         const id = req.user.id

//         const email = req.body
//         const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

//     //mail options
//         const mailoptions = {
//             from: process.env.AUTH_EMAIL,
//             to: email,
//             subject: "verify your Email",
//             html: `<p>  Enter <b>${otp}</b> in the app to verify your email address</p>`,
//             p: `<p> this code expires in 1 hour</p>`,
//         }

//         const saltround = 10;

//         const expiresAt = Date.now()+3600000
//         const hashedOtp = await bcrypt.hash(otp, saltround);
         
//         const res = await db.query("UPDATE users SET (verified, otp, expriesAt) VALUES ($1, $2, $3) WHERE id= $4 ", [
//             true, otp, expiresAt, id
//         ])

//         await transporter.sendMail(mailoptions)

//         res.json({
//             status: "pending",
//             message: 'verification otp email sent',
//             data: {
//                 userId: id,
//                 email,
//             }
//         })

//     } catch (error) {
//         res.json({
//             success: false,
//             message: 'failed to send otp'
//         })
//     }
// }


// exports.userOtpVerificationSchema = async (req, res) => {

// }


// exports.VerifyEmail = async (req, res) => {
//    try {
//        const {id } = req.user.id
//      const {otp} = req.body

//      if (!id || otp) {
//         throw Error("Empty otp details are not allowed.")
//      } else {
//         const userOtpVerificationrecords = userOtpVerificationSchema.find({
//             id
//         })

//         if (userOtpVerificationrecords <= 0) {
//             throw new Error("Account record doesn't exist or has been verified already.. signup or login")
//         } else {
//             const {expiresAt} = userOtpVerificationrecords[0]
//             const hashedOtp = userOtpVerificationrecords[0].otp
            
//             if (expiresAt < Date.now()) {
//                 // user otp record has expired
//                 this.userOtpVerificationSchema.de
//                 throw new Error("Code has expired. please request again")
//             } else {
//                 const validOtp = bcrypt.compare(otp, hashedOtp)

//                 if (!validOtp) {
//                     //supplied otp is wrong
//                     throw new Error("Invalid code passed. chekc your inbox.");
//                 } else {
//                     await db.query("UPDATE users SET (verified) VALUES ($1) WHERE id = $2", [
//                          true, id
//                     ])

//                     res.json({
//                         sta
//                     })           
//                 }
//             }
//         }


//      }
//    } catch (error) {
    
//    }
// }













const db = require("../modules/db");
const bcrypt = require("bcrypt");
const transporter = require("../config/mailer");

exports.sendOtpVerificationEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    await db.query(
      `
      UPDATE users
      SET otp_hash = $1,
          otp_expires_at = $2
      WHERE id = $3
      `,
      [hashedOtp, expiresAt, userId]
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

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};



exports.verifyEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    const result = await db.query(
      `
      SELECT otp_hash, otp_expires_at
      FROM users
      WHERE id = $1
      `,
      [userId]
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
      WHERE id = $1
      `,
      [userId]
    );

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
};
