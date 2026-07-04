// // config/mailer.js
// require("dotenv").config();
// const { Resend } = require("resend");

// if (!process.env.RESEND_API_KEY) {
//   throw new Error("Missing RESEND_API_KEY in environment variables");
// }

// const resend = new Resend(process.env.RESEND_API_KEY);

// module.exports = async function sendEmail({ to, subject, text, html }) {
//   try {
//     const response = await resend.emails.send({
//        from: "Skillwrap <noreply@skillwrap.com>", // must be verified sender
//       to,
//       subject,
//       text,
//       html,
//     });
//     // console.log("📬 Email sent via Resend:", response);
//     return response;
//   } catch (err) {
//     console.error("❌ Resend send email error:", err);
//     throw err;
//   }
// };












const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDGRID_SENDER_EMAIL,
    pass: process.env.AUTH_EMAIL_PASSWORD,
  },
});

module.exports = transporter;





// const sgMail = require("@sendgrid/mail");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async ({ to, subject, text, html }) => {
//   const msg = {
//     to,
//     from: process.env.SENDGRID_SENDER_EMAIL, // must be a verified sender
//     subject,
//     text,
//     html,
//   };

//   try {
//     await sgMail.send(msg);
//     console.log("✅ Email sent to", to);
//   } catch (err) {
//     console.error("❌ Email error:", err);
//     throw err;
//   }
// };

// module.exports = sendEmail;


