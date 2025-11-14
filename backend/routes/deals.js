// routes/deals.js
const express = require("express");
const router = express.Router();
const { getAllDeals } = require("../controllers/dealController");

// ✅ Get all deals route
router.get("/", getAllDeals);

module.exports = router;
