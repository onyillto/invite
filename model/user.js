const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Main Invitee Information
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },

  // Optional Plus One Information
  plusOne: {
    type: {
      firstname: {
        type: String,
      },
      lastname: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    // plusOne is optional, so we make it default to null
    default: null,
  },

  // Optional Plus Two Information
  plusTwo: {
    type: {
      firstname: {
        type: String,
      },
      lastname: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    // plusTwo is optional, so we make it default to null
    default: null,
  },

  // Role of the User
  role: {
    type: String,
    enum: ["member", "committee"], // Restrict to specific roles
    default: "member", // Default role
  },

  // Action Status
  action: {
    type: String,
    enum: ["pending", "verified"], // Define possible statuses
    default: "pending", // Default status
  },
});

// Creating the User model
const User = mongoose.model("User", userSchema);

module.exports = User;

