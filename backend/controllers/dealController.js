// controllers/dealController.js
const Deal = require("../models/Deal");
const express = require("express");


// ✅ Get all deals (populated with employee names)
exports.getAllDeals = async (req, res) => {
  try {
    
    const deals = await Deal.find()
      .populate("assignfrom", "name") // only fetch name, email
      .populate("assignto", "name")   // only fetch name, email
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (err) {
    console.error("❌ Error fetching deals:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching deals",
    });
  }
};
