const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const leadController = require('../controllers/leadController');
const auth = require('../middleware/auth');
const Lead = require('../models/Lead'); // ✅ ADD THIS LINE
const Deal = require("../models/Deal");
// create lead (any authenticated user)
// router.post(
//   '/',
//   auth,
//   [
//     body('name').notEmpty().withMessage('Name required'),
//     // other validations optional
//   ],
//   leadController.createLead
// );
// Create new lead
router.post("/create", async (req, res) => {
  try {
    console.log("📥 Received data:", req.body);

    const newLead = new Lead(req.body);
    await newLead.save();

    console.log("✅ Lead saved successfully:", newLead);
    res.status(201).json({
      success: true,
      message: "Lead stored successfully!",
      data: newLead, // ✅ use newLead (not lead)
    });
  } catch (err) {
    console.error("❌ Error while saving lead:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});


// list leads (admin sees all, employees see assigned/created)
// router.get('/', auth, leadController.listLeads);
// GET all leads (diagnostic)
router.get("/", async (req, res) => {
  try {
    console.log("📥 GET /api/leads");
    const leads = await Lead.find().lean();
    console.log("✅ found leads count:", leads.length);
    return res.json(leads);
  } catch (err) {
    console.error("❌ Error fetching leads:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// get single
router.get('/:id', auth, leadController.getLead);

// update
// PUT: Update Lead by ID
// UPDATE a lead by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("✏️ Updating lead with ID:", id);
    console.log("📦 Incoming data:", req.body);

    // Validate ID
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing lead ID" });
    }

    // Perform the update
    const updatedLead = await Lead.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
      runValidators: true, // validate based on schema
    }).lean();

    if (!updatedLead) {
      console.log("⚠️ Lead not found for update:", id);
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    console.log("✅ Lead updated successfully:", updatedLead);
   
    // Check if leadStatus is "Demo Scheduled"
    if (req.body.leadstatus === "Demo Scheduled") {
      // Check if deal already exists for this lead
      console.log("🎯 Lead status is 'Demo Scheduled' — checking for deal...");
      const existingDeal = await Deal.findOne({ leadId: updatedLead._id });

      if (!existingDeal) {
        console.log("🚀 Creating new Deal for lead:", updatedLead.name);

        const newDeal = new Deal({
          name: updatedLead.name,
          domain: updatedLead.domain,
          phone: updatedLead.phone,
          category: updatedLead.category,
          leadsource: updatedLead.leadsource,
          location: updatedLead.location,
          assignfrom: updatedLead.assignfrom,
          assignto: updatedLead.assignto,
          leadstatus: updatedLead.leadstatus,
          leadId: updatedLead._id,
        });

        await newDeal.save();
        console.log("✅ Deal created successfully:", newDeal._id);
      } else {
        console.log("⚙️ Deal already exists for this lead — skipping creation.");
      }
    }
    
    return res.json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    });
  } catch (err) {
    console.error("❌ Error updating lead:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during update",
      error: err.message,
    });
  }
});

// delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Delete request for lead ID:", id);

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await Lead.findByIdAndDelete(id);
    console.log("✅ Lead deleted successfully:", id);

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting lead:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ✅ Get recently created leads (last 30 days)
router.get("/recent", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLeads = await Lead.find({
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentLeads);
  } catch (err) {
    console.error("❌ Error fetching recent leads:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
