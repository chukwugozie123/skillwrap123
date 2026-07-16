require("dotenv").config();
const nodemailer = require("nodemailer");

if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
  throw new Error("Missing EMAIL or APP_PASSWORD in environment variables");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

module.exports = async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  try {
    const response = await transporter.sendMail({
      from: `"SkillWrap" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("📬 Email sent:", response.messageId);

    return response;
  } catch (err) {
    console.error("❌ Nodemailer send email error:", err.message);
    throw err;
  }
};












// require("dotenv").config();
// const { Resend } = require("resend");

// if (!process.env.RESEND_API_KEY) {
//   throw new Error("Missing RESEND_API_KEY in environment variables");
// }


// const resend = new Resend(process.env.RESEND_API_KEY);



// module.exports = async function sendEmail({
//   to,
//   subject,
//   text,
//   html
// }) {

//   try {

//     const response = await resend.emails.send({

//       from: "SkillWrap <onboarding@resend.dev>",

//       to,

//       subject,

//       text,

//       html,

//     });


//     console.log("📬 Resend response:", response);


//     // IMPORTANT
//     if (response.error) {
//       throw new Error(response.error.message);
//     }


//     return response;


//   } catch(err) {

//     console.error(
//       "❌ Resend send email error:",
//       err.message
//     );

//     throw err;

//   }
// };


