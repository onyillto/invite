const Commitee = require("../model/commitee");
const qrcode = require("qrcode");
const sendEmail = require("../utils/emaill");

const submitTwoRSVP = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, plusOne, plusTwo } = req.body;

    // Validate and format Plus One and Plus Two details
    const formatGuestDetails = (guest, label) => {
      if (
        !guest ||
        !guest.firstName ||
        !guest.lastName ||
        !guest.email ||
        !guest.phone
      ) {
        throw new Error(
          `Please provide all details for ${label} (First Name, Last Name, Email, Phone).`
        );
      }
      return {
        firstname: guest.firstName,
        lastname: guest.lastName,
        email: guest.email,
        phone: guest.phone,
      };
    };

    const plusOneDetails = plusOne
      ? formatGuestDetails(plusOne, "Plus One")
      : null;
    const plusTwoDetails = plusTwo
      ? formatGuestDetails(plusTwo, "Plus Two")
      : null;

    // Create new committee entry
    const newCommittee = new Commitee({
      firstname: firstName,
      lastname: lastName,
      email,
      phone,
      plusOne: plusOneDetails,
      plusTwo: plusTwoDetails,
    });

    // Save committee details to the database
    await newCommittee.save();

    // Define the RSVP email content
    const emailContent = `
      <html>
  <body>
    <h3>🎉 RSVP Confirmation 🎉</h3>
    <p>Your RSVP has been successfully recorded.</p>
    <div>
      <pre>
        First Name: ${firstName}
        Last Name: ${lastName}
        Email: ${email}
        Phone: ${phone}
      </pre>
    </div>
    <p>We look forward to seeing you at the event!</p>
    <img src="cid:qrCode" alt="QR Code" />
  </body>
</html>

    `;

    // Generate and save QR code for the main invitee
    const qrCodePath = "./qrcode.png"; // Ensure this path is correct in your deployment environment
    await qrcode.toFile(qrCodePath, emailContent);

    // Function to send RSVP emails
    const sendRSVPEmail = async (recipient, data, content) => {
      if (!recipient) return;
      const emailData = {
        to: recipient.email,
        subject: `${recipient.label} RSVP Confirmation`,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        qrCodePath, // Attach QR code
        html: content, // Pass email content as an argument
      };
      await sendEmail(emailData);
    };

    // Send email to Plus One, Plus Two only if they exist
    if (plusOneDetails) {
      await sendRSVPEmail(
        plusOneDetails,
        {
          label: "Plus One",
          ...plusOneDetails,
        },
        emailContent // Pass email content explicitly
      );
    }
    if (plusTwoDetails) {
      await sendRSVPEmail(
        plusTwoDetails,
        {
          label: "Plus Two",
          ...plusTwoDetails,
        },
        emailContent // Pass email content explicitly
      );
    }

    // Send email to the committee
    const committeeEmails = await Commitee.find().distinct("email");
    const committeeEmailData = {
      to: [email, ...committeeEmails],
      subject: "RSVP Confirmation",
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone: phone,
      qrCodePath,
      html: emailContent, // Pass email content to committee email
    };
    await sendEmail(committeeEmailData);

    // Respond with success
    res.status(200).json({
      message: "RSVP submitted successfully",
      committee: newCommittee,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error saving RSVP",
      error: error.message,
    });
  }
};

module.exports = submitTwoRSVP;
