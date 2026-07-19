require("dotenv").config();
const axios = require("axios");

module.exports = async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "SkillWrap",
          email: "umechefelix@gmail.com", // your verified sender
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        textContent: text,

        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVOAPIKEY, // replace with your key for testing
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("📬 Brevo Response:", response.data);

    return response.data;
  } catch (err) {
    console.error(
      "❌ Brevo Error:",
      err.response?.data || err.message
    );

    throw err;
  }
};

