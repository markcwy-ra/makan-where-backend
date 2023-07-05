const nodemailer = require("nodemailer");

const createTransporter = async () => {
  // let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: process.env.NODEMAILER_HOST,
    // port: process.env.NODEMAILER_PORT,
    // secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Test the transporter
  transporter.verify((error, success) => {
    if (error) {
      console.error("Error verifying transporter:", error);
    } else {
      console.log("Transporter is ready to send emails");
    }
  });

  return transporter;
};

module.exports = createTransporter;
