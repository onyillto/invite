const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const qrcode = require("qrcode");
const sendEmail = require("../utils/email");

const submitRSVP = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the incoming request body

    const { firstName, lastName, email, phone, plusOne } = req.body;
    const firstname = firstName;
    const lastname = lastName;

    // Log plusOne data to check if it's included in the request
    console.log("Plus One Data:", plusOne);

    let plusOneDetails = null;
    if (plusOne) {
      const {
        firstName: plusOneFirstName,
        lastName: plusOneLastName,
        email: plusOneEmail,
        phone: plusOnePhone,
      } = plusOne;

      if (
        !plusOneFirstName ||
        !plusOneLastName ||
        !plusOneEmail ||
        !plusOnePhone
      ) {
        return res.status(400).json({
          message:
            "Please provide all details for Plus One (First name, Last name, Email, Phone)",
        });
      }

      plusOneDetails = {
        firstname: plusOneFirstName,
        lastname: plusOneLastName,
        email: plusOneEmail,
        phone: plusOnePhone,
      };
    }

    // Create the new User document with plusOne details
    const newUser = new User({
      firstname,
      lastname,
      email,
      phone,
      plusOne: plusOneDetails, // Store the plusOne details if available
    });

    console.log("New User Data:", newUser);

    // Save the user to the database
    await newUser.save();

    // Prepare the RSVP data to generate the QR code
    const rsvpData = `
      First Name: ${firstname}
      Last Name: ${lastname}
      Email: ${email}
      Phone: ${phone}
      Plus One: ${plusOne ? "Yes" : "No"}
    `;

    // Generate the QR code and save it to a file
    const qrCodePath = await qrcode.toFile("./qrcode.png", rsvpData);

    // Prepare the email data to be sent
    const emailData = {
      to: email,
      subject: "RSVP Confirmation",
      firstName: firstname,
      lastName: lastname,
      email: email,
      phone: phone,
      plusOne: plusOneDetails ? "Yes" : "No",
      plusOneDetails: plusOneDetails, // Pass the full Plus One details for the email template
      qrCodePath: qrCodePath,
    };

    // Send the email with the RSVP confirmation and QR code
    await sendEmail(emailData);

    // Send a success response to the client
    res.status(200).json({
      message: "RSVP submitted successfully",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error saving RSVP",
      error: error.message,
    });
  }
};


//Get All RSVP
const getAllRSVPs = async (req, res) => {
  try {
    // Query the database to get all RSVP records
    const allRSVPs = await User.find(); // Assumes `User` is the model for RSVP data

    // Check if there are no records
    if (!allRSVPs || allRSVPs.length === 0) {
      return res.status(404).json({
        message: "No RSVP records found",
      });
    }

    // Return the RSVP records as a JSON response
    res.status(200).json({
      message: "RSVP records retrieved successfully",
      data: allRSVPs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving RSVP records",
      error: error.message,
    });
  }
};
const searchUsers = async (req, res) => {
  try {
    console.log("Query Parameters:", req.query);

    const searchCriteria = {};
    for (const [key, value] of Object.entries(req.query)) {
      console.log(`Adding search criteria - ${key}: ${value}`);
      searchCriteria[key] = { $regex: value, $options: "i" };
    }

    console.log("Final Search Criteria:", searchCriteria);

    const users = await User.find(searchCriteria);
    console.log("Users Found:", users);

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found matching the criteria" });
    }

    res
      .status(200)
      .json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    console.error("Error in searchUsers controller:", error);
    res
      .status(500)
      .json({ message: "Error searching for users", error: error.message });
  }
};


const updateRSVP = async (req, res) => {
  try {
    const { userId } = req.params; // Get the userId from the request parameters
    const { action } = req.body; // Get the updated action value from the request body

    // Ensure action is valid
    if (!action || !["pending", "verified"].includes(action)) {
      return res.status(400).json({
        message:
          "Invalid action value. It must be either 'pending' or 'verified'.",
      });
    }

    // Find and update the user by their userId
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { action }, // Update the action field
      { new: true } // Return the updated user document
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return the updated user
    res.status(200).json({
      message: "User RSVP action updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateRSVP controller:", error);
    res.status(500).json({
      message: "Error updating RSVP",
      error: error.message,
    });
  }
};


module.exports = {
  submitRSVP,
  getAllRSVPs,
  searchUsers,
  updateRSVP
};
