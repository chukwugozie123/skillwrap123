const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_EMAIL_PASSWORD,
  },
});

module.exports = transporter;

// how should i go immeadietly after i sign up i ask for otp or i wait tiill they ogin in then ask fo rotp 
// but if i do it after sign up req.user woudl be undefined soo now session untill i login in...

// i nneed ur advice when should we ask for otp and whcih routes are needed

// and how would i get this
// AUTH_EMAIL,
//     pass: process.env.AUTH_EMAIL_PASSWORD

// ALTER TABLE users
// ADD COLUMN otp_hash TEXT,
// ADD COLUMN otp_expires_at BIGINT,
// ADD COLUMN email_verified BOOLEAN DEFAULT false;
