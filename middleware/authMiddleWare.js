const jwt = require("jsonwebtoken");
const  User  = require("../model/user");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const authorizationHeader = req.header("Authorization");
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      console.error("No token found in header");
      return res.status(401).send({ error: "Please authenticate." });
    }

    const token = authorizationHeader.replace("Bearer ", "");
    console.log("Token received:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(
     { _id: decoded._id,
      "tokens.token": token,}
    );

    if (!user) {
      console.error("User not found with this token");
      return res.status(401).send({ error: "User not found." });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).send({ error: "Please authenticate." });
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    const admin = await User.findOne({ email });

    if (admin && admin.role !== "admin") {
      throw new Error("User is not an admin");
    } else {
      // If the user is an admin, proceed to the next middleware/route handler
      next();
    }
  } catch (error) {
    // Handle errors, such as user not found or not being an admin
    throw new Error(error);
  }
});

module.exports = { authMiddleware, isAdmin };
