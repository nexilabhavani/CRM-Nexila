
// controllers/leadController.js
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Student = require("../models/Student");
const User = require("../models/User");
const axios = require("axios"); 

// ✅ Create Lead
exports.createLead = async (req, res) => {
  try {
    console.log("📥 Creating Lead:", req.body);
     //  FIX: define data FIRST
    const data = { ...req.body };

    //  Convert empty strings to null (ObjectId safety)
    if (!data.assignfrom || data.assignfrom === "") data.assignfrom = null;
    if (!data.assignto || data.assignto === "") data.assignto = null;
    const newLead = new Lead({
      ...data,
      createdBy: req.user ? req.user._id : null, 
      // store creator if authenticated
    });

    await newLead.save();

  //  2️⃣ Prepare WhatsApp Number
    let phone = newLead.phone; // 🔴 make sure this field exists
    if (!phone) {
      return res.status(201).json({
        success: true,
        message: "Lead created (No phone to send WhatsApp)",
        data: newLead,
      });
    }

    // Convert to international format
    const whatsappId = phone.startsWith("91") ? phone : `91${phone}`;

    // 3️⃣ AUTO TRIGGER WhatsApp Message
    await axios.post(
      `${process.env.WATI_BASE_URL}/sendTemplateMessage`+
  `?whatsappNumber=${whatsappId}`,
      {
      
        template_name: "ds_dec13_link",
        broadcast_name: "auto_lead",
        parameters: [
          {
            name: "name",
            value: newLead.name,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WATI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then(res => {
        console.log("✅ WATI OK", res.data);
      })
      .catch(err => {
        console.log("❌ STATUS:", err.response?.status);
        console.log("❌ DATA:", err.response?.data);
      });
//     axios.post( "https://live-server-1020387.wati.io/api/v2/sendTemplateMessage" +
//   "?whatsappNumber=919360228893",
//   {
   
//     template_name: "aiml_intern",
//     broadcast_name: "lead_auto_msg",
   
//   },
//   {
//     headers: {
//       Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImluZm9AbmV4aWxhdGVjaG5vbG9naWVzLmNvbSIsIm5hbWVpZCI6ImluZm9AbmV4aWxhdGVjaG5vbG9naWVzLmNvbSIsImVtYWlsIjoiaW5mb0BuZXhpbGF0ZWNobm9sb2dpZXMuY29tIiwiYXV0aF90aW1lIjoiMTIvMTcvMjAyNSAwNTo0NToxMCIsInRlbmFudF9pZCI6IjEwMjAzODciLCJkYl9uYW1lIjoibXQtcHJvZC1UZW5hbnRzIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQURNSU5JU1RSQVRPUiIsImV4cCI6MjUzNDAyMzAwODAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.tPp4U8eGCwLz6QG9GuckxeLmEBUHej6mQkoULcUIYs8`,
//       "Content-Type": "application/json"
//     }
//   }
// )
// .then(res => {
//   console.log("✅ WATI OK", res.data);
// })
// .catch(err => {
//   console.log("❌ STATUS:", err.response?.status);
//   console.log("❌ DATA:", err.response?.data);
// });

    // 4️⃣ Final Response
    res.status(201).json({
      success: true,
      message: "Lead created & WhatsApp sent automatically",
      data: newLead,
    });

  } catch (err) {
    console.error("❌ Error creating lead:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Lead created but WhatsApp failed",
    });
  }
};

// ✅ List Leads (Admin sees all, Employee sees only assigned/created)
exports.listLeads = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    let filter = {};

    if (userRole !== "admin") {
      filter = {
        $or: [
          { assignto: userId },
          { assignfrom: userId },
          { createdBy: userId },
        ],
      };
    }

    const leads = await Lead.find(filter)
      .populate("assignfrom", "name email role")
      .populate("assignto", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err) {
    console.error("❌ Error fetching leads:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get Single Lead
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignfrom", "name email role")
      .populate("assignto", "name email role")
      .populate("createdBy", "name email role");

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({ success: true, lead });
  } catch (err) {
    console.error("❌ Error fetching lead:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("✏️ Updating lead:", id);
    console.log("📦 Incoming:", req.body);

    const payload = { ...req.body };

    // --------------------------------------------------
    // 1️⃣ CLEAN assignfrom / assignto
    // --------------------------------------------------
    const needsAssign =
      payload.leadstatus === "Demo Scheduled" ||
      payload.leadstatus === "Student";

    if (!needsAssign) {
      delete payload.assignfrom;
      delete payload.assignto;
    } else {
      // remove invalid values
      if (!payload.assignfrom || payload.assignfrom === "N/A") {
        delete payload.assignfrom;
      }
      if (!payload.assignto || payload.assignto === "N/A") {
        delete payload.assignto;
      }

      // convert name → ObjectId
      if (payload.assignfrom && typeof payload.assignfrom === "string") {
        const fromUser = await User.findOne({ name: payload.assignfrom });
        if (fromUser) payload.assignfrom = fromUser._id;
      }

      if (payload.assignto && typeof payload.assignto === "string") {
        const toUser = await User.findOne({ name: payload.assignto });
        if (toUser) payload.assignto = toUser._id;
      }
    }

    // --------------------------------------------------
    // 2️⃣ DATE NORMALIZATION
    // --------------------------------------------------
    payload.followdate = payload.followdate || null;
    payload.demodate = payload.demodate || null;

    // --------------------------------------------------
    // 3️⃣ UPDATE LEAD (NOW SAFE)
    // --------------------------------------------------
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    console.log("✅ Lead updated");

    // --------------------------------------------------
    // 4️⃣ SYNC DEAL
    // --------------------------------------------------
    const existingDeal = await Deal.findOne({ leadId: updatedLead._id });
    if (existingDeal) {
      await Deal.findOneAndUpdate(
        { leadId: updatedLead._id },
        updatedLead,
        { new: true }
      );
    }

    // --------------------------------------------------
    // 5️⃣ SYNC STUDENT
    // --------------------------------------------------
    const existingStudent = await Student.findOne({ leadId: updatedLead._id });
    if (existingStudent) {
      await Student.findOneAndUpdate(
        { leadId: updatedLead._id },
        updatedLead,
        { new: true }
      );
    }

    // --------------------------------------------------
    // 6️⃣ CREATE DEAL / STUDENT IF NEEDED
    // --------------------------------------------------
    if (updatedLead.leadstatus === "Demo Scheduled" && !existingDeal) {
      await Deal.create({ ...updatedLead, leadId: updatedLead._id });
    }

    if (updatedLead.leadstatus === "Student" && !existingStudent) {
      await Student.create({ ...updatedLead, leadId: updatedLead._id });
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
      message: err.message,
    });
  }
};
                  
// ✅ Delete Lead
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead)
      return res.status(404).json({ success: false, message: "Lead not found" });

    await Lead.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Lead deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting lead:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Recent Leads (last 30 days)
exports.recentLeads = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leads = await Lead.find({ createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({ success: true, leads });
  } catch (err) {
    console.error("❌ Error fetching recent leads:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
