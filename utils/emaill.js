const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.Mail_Id, // Your email
      pass: process.env.Mail_Password, // Your email password
    },
  });

  await transporter.sendMail({
    from: process.env.Mail_Id,
    to: data.email,
    subject: "RSVP Confirmation",
    html: data.html,
    attachments: [
      {
        filename: "qrcode.png",
        path: data.qrCodePath, // Path to the QR code file
        cid: "qrCode", // A unique identifier for the attachment
      },
    ],
  });

  console.log("Email sent successfully to:", data.email);
});

module.exports = sendEmail;
