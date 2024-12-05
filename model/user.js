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

  role: {
    type: String,
    enum: ["member", "committee"],
    default: "member",
  },
  action: {
    type: String,
    enum: ["pending", "verified"],
    default: "pending",
  },
});

// Creating the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
