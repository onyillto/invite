require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const dbConnect = require("./config/dbConnect");
const user = require("./routes/route");

const cors = require("cors");

const app = express();
const port = process.env.PORT || 9000;
dbConnect()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));

// CORS configuration
// Enable CORS for all routes
app.use(cors());




app.use("/api/v1/user", user);

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
