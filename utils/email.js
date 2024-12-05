const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

// Function to generate a QR code
const generateQRCode = async (data) => {
  try {
    const filePath = path.join(__dirname, "qrcode.png");
    await QRCode.toFile(filePath, data);
    return filePath; // Return the file path of the generated QR code
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw new Error("Error generating QR code");
  }
};

const sendEmail = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.Mail_Id, // Your email
      pass: process.env.Mail_Password, // Your email password
    },
  });

  // Create a base RSVP data string
  let rsvpData = `
    First Name: ${data.firstName}
    Last Name: ${data.lastName}
    Email: ${data.email}
    Phone: ${data.phone}
    Plus One: ${data.plusOne ? "Yes" : "No"}
  `;

  // Add Plus One data if available
  if (data.plusOneDetails) {
    rsvpData += `
      Plus One First Name: ${data.plusOneDetails.firstname}
      Plus One Last Name: ${data.plusOneDetails.lastname}
      Plus One Email: ${data.plusOneDetails.email}
      Plus One Phone: ${data.plusOneDetails.phone}
    `;
  }

  // Generate the QR code with all the RSVP data, including Plus One if present
  const qrCodePath = await generateQRCode(rsvpData);

  // Prepare the Plus One details section for the email body
  let plusOneDetailsSection = "";
  if (data.plusOneDetails) {
    plusOneDetailsSection = `
      <h4>Plus One Details:</h4>
      <p><strong>First Name:</strong> ${data.plusOneDetails.firstname}</p>
      <p><strong>Last Name:</strong> ${data.plusOneDetails.lastname}</p>
      <p><strong>Email:</strong> ${data.plusOneDetails.email}</p>
      <p><strong>Phone:</strong> ${data.plusOneDetails.phone}</p>
    `;
  }

  // Prepare the recipient list
  const recipients = [data.to]; // Start with the main recipient
  if (data.plusOneDetails && data.plusOneDetails.email) {
    recipients.push(data.plusOneDetails.email); // Add the Plus One's email if available
  }

  // Send the email
  let info = await transporter.sendMail({
    from: process.env.MAIL_ID, // sender address
    to: recipients.join(", "), // send to both the main user and the Plus One (if available)
    subject: data.subject, // Subject line
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              padding: 20px;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header img {
              max-width: 200px;
              height: auto;
            }
            .content {
              margin-bottom: 20px;
            }
            .qr-code {
              text-align: center;
              margin-top: 20px;
            }
            .qr-code img {
              width: 150px;
              height: 150px;
            }
            .plus-one-section {
              margin-top: 20px;
              padding: 10px;
              background-color: #f9f9f9;
              border-radius: 8px;
            }
            .plus-one-section h4 {
              margin-top: 0;
            }
          </style>
        </head>
        <body>
         <div class="email-container">
  <div class="header">
   
  </div>
  
  <div class="content">
    <h3>🎉 Mediterranean Recreational Center End-Of-Year Party 🎉</h3>
    <p>Your RSVP has been successfully recorded. Below are the details:</p>
    
    <!-- Use a table for better alignment of data -->
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; font-weight: bold;">First Name:</td>
        <td style="padding: 10px; color: #333;">${data.firstName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Last Name:</td>
        <td style="padding: 10px; color: #333;">${data.lastName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Email:</td>
        <td style="padding: 10px; color: #333;">${data.email}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Phone:</td>
        <td style="padding: 10px; color: #333;">${data.phone}</td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold;">Plus One:</td>
        <td style="padding: 10px; color: #333;">${data.plusOne}</td>
      </tr>
    </table>

    <!-- Plus One Details Section (only if applicable) -->
    ${
      data.plusOneDetails
        ? `
      <div class="plus-one-section" style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 8px;">
        <h4>🎉 Plus One Details 🎉</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; font-weight: bold;">First Name:</td>
            <td style="padding: 10px; color: #333;">${data.plusOneDetails.firstname}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Last Name:</td>
            <td style="padding: 10px; color: #333;">${data.plusOneDetails.lastname}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Email:</td>
            <td style="padding: 10px; color: #333;">${data.plusOneDetails.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Phone:</td>
            <td style="padding: 10px; color: #333;">${data.plusOneDetails.phone}</td>
          </tr>
        </table>
      </div>
    `
        : ""
    }

    <div class="qr-code" style="text-align: center; margin-top: 20px;">
      <p>Your unique QR code for this RSVP:</p>
      <img src="cid:qrcode" alt="RSVP QR Code" style="width: 150px; height: 150px;" />
    </div>
  </div>
</div>

        </body>
      </html>
    `,
    attachments: [
      {
        filename: "qrcode.png",
        path: qrCodePath, // Attach the QR code image
        cid: "qrcode", // This is the CID that is referenced in the HTML email
      },
    ],
  });

  // Log the response and clean up the QR code file after sending the email
  console.log("Email sent:", info.response);
  fs.unlinkSync(qrCodePath); // Delete the generated QR code image
});

module.exports = sendEmail;
