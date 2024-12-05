const express = require("express");
const route = express.Router();
const {authMiddleware,isAdmin} = require('../middleware/authMiddleWare')
const {  submitRSVP,getAllRSVPs,searchUsers,updateRSVP } = require("../controller/user");


route.post("/rsvp", submitRSVP);
route.get("/rsvps", getAllRSVPs);
route.get("/search", searchUsers);
route.put("/rsvp/:userId", updateRSVP);
module.exports = route;