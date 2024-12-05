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
        background-color: #f4f4f9;
        margin: 0;
        padding: 0;
      }

      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
      }

      .header img {
        max-width: 200px;
        height: auto;
      }

      .content {
        color: #333;
        line-height: 1.6;
      }

      h3 {
        color: #2d3e50;
        font-size: 24px;
        text-align: center;
        margin-bottom: 15px;
      }

      p {
        font-size: 16px;
        color: #555;
        margin-bottom: 20px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }

      table td {
        padding: 12px;
        text-align: left;
        color: #555;
      }

      table td:first-child {
        font-weight: bold;
        color: #2d3e50;
      }

      .plus-one-section {
        background-color: #f8f8f8;
        padding: 15px;
        border-radius: 8px;
        margin-top: 30px;
      }

      .plus-one-section h4 {
        font-size: 20px;
        margin-bottom: 10px;
        color: #2d3e50;
      }

      .qr-code {
        text-align: center;
        margin-top: 30px;
      }

      .qr-code img {
        width: 150px;
        height: 150px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }

      .footer {
        text-align: center;
        margin-top: 40px;
        font-size: 14px;
        color: #888;
      }

      .footer a {
        color: #007bff;
        text-decoration: none;
      }

      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img src="https://scontent.fabv6-1.fna.fbcdn.net/v/t39.30808-6/469164791_1104047111728513_4039241009852570437_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGLVd_ok95KgGNsz8c-Bp818TskDgm3ApLxOyQOCbcCkhNH3-WRtp1LnuLjO7xM_5Qkuzc6S6AHD2P9WVusMmP_&_nc_ohc=v1I-bNVEwHoQ7kNvgG-TjwH&_nc_zt=23&_nc_ht=scontent.fabv6-1.fna&_nc_gid=A6YexVH8W2HrNi-JkdwnK6F&oh=00_AYA0j32T6e4-GmDQuQCZPFauJ6aSeiO7kHtEz70aCry3-w&oe=6757BF26" alt="Mediterranean Recreational Center Logo">
      </div>

      <div class="content">
        <h3>🎉 Mediterranean Recreational Center End-Of-Year Party 🎉</h3>
        <p>Your RSVP has been successfully recorded. Below are the details:</p>

        <!-- Use a table for better alignment of data -->
        <table>
          <tr>
            <td>First Name:</td>
            <td>${data.firstName}</td>
          </tr>
          <tr>
            <td>Last Name:</td>
            <td>${data.lastName}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>${data.email}</td>
          </tr>
          <tr>
            <td>Phone:</td>
            <td>${data.phone}</td>
          </tr>
          <tr>
            <td>Plus One:</td>
            <td>${data.plusOne}</td>
          </tr>
        </table>

        <!-- Plus One Details Section (only if applicable) -->
        ${
          data.plusOneDetails
            ? `
            <div class="plus-one-section">
              <h4>🎉 Plus One Details 🎉</h4>
              <table>
                <tr>
                  <td>First Name:</td>
                  <td>${data.plusOneDetails.firstname}</td>
                </tr>
                <tr>
                  <td>Last Name:</td>
                  <td>${data.plusOneDetails.lastname}</td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>${data.plusOneDetails.email}</td>
                </tr>
                <tr>
                  <td>Phone:</td>
                  <td>${data.plusOneDetails.phone}</td>
                </tr>
              </table>
            </div>
          `
            : ""
        }

        <div class="qr-code">
          <p>Your unique QR code for this RSVP:</p>
          <img src="cid:qrcode" alt="RSVP QR Code">
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your RSVP! We look forward to celebrating with you. For more information, visit our <a href="https://www.mediterraneanrecreation.com">website</a>.</p>
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
