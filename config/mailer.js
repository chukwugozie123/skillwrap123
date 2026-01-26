// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.AUTH_EMAIL,
//     pass: process.env.AUTH_EMAIL_PASSWORD,
//   },
// });

// module.exports = transporter;





const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER_EMAIL, // must be a verified sender
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent to", to);
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
};

module.exports = sendEmail;

