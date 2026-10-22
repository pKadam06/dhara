require("dotenv").config();

const transporter = require("./config/mail");

async function test() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Mail",
      text: "This is a test email."
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.log("❌ Error:");
    console.log(err);
  }
}

test();