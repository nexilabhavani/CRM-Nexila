
// controllers/leadController.js
const mongoose = require("mongoose");
const Lead = require("../models/Lead");
const Deal = require("../models/Deal");
const Student = require("../models/Student");
const User = require("../models/User");
const axios = require("axios"); 
const Studentlog=require("../models/Studentlog");
const detectChanges = require("../utils/detectChanges");
// ✅ Create Lead
exports.createLead = async (req, res) => {
  try {
  

    const data = { ...req.body };

    // ---------------- assignfrom ----------------
    if (data.assignfrom) {
      if (mongoose.Types.ObjectId.isValid(data.assignfrom)) {
        // already ObjectId → keep
        data.assignfrom = data.assignfrom;
      } else {
        // name → convert
        const user = await User.findOne({ name: data.assignfrom });
        data.assignfrom = user ? user._id : null;
      }
    } else {
      data.assignfrom = null;
    }

    // ---------------- assignto ----------------
    if (data.assignto) {
      if (mongoose.Types.ObjectId.isValid(data.assignto)) {
        data.assignto = data.assignto;
      } else {
        const user = await User.findOne({ name: data.assignto });
        data.assignto = user ? user._id : null;
      }
    } else {
      data.assignto = null;
    }

    console.log("✅ FINAL DATA:", data);
  // // 2️⃣ Convert EMPTY / N/A → null (ObjectId safety)

  // if (!data.assignfrom || data.assignfrom === "" || data.assignfrom === "N/A") {
  //   data.assignfrom = null;
  // }

  // if (!data.assignto || data.assignto === "" || data.assignto === "N/A") {
  //   data.assignto = null;
  // }


  // // --------------------------------------------------
  // // 3️⃣ Convert NAME → ObjectId (User lookup)
  // // --------------------------------------------------
  // if (data.assignfrom && typeof data.assignfrom === "string") {
  //   const fromUser = await User.findOne({ name: data.assignfrom });
  //   data.assignfrom = fromUser ? fromUser._id : null;
  // }

  // if (data.assignto && typeof data.assignto === "string") {
  //   const toUser = await User.findOne({ name: data.assignto });
  //   data.assignto = toUser ? toUser._id : null;
  // }


  const newLead = new Lead({
    ...data,
    createdBy: req.user ? req.user._id : null,
  });

  await newLead.save();
  console.log("✅ Lead created:", newLead._id);

  // --------------------------------------------------
  // 5️⃣ SYNC DEAL ON CREATE
  // --------------------------------------------------
  if (newLead.leadstatus === "Demo Scheduled") {
    await Deal.findOneAndUpdate(
      { leadId: newLead._id },
      { ...newLead.toObject(), leadId: newLead._id },
      { upsert: true, new: true }
    );
    console.log("📦 Deal created from Lead");
  }

  // --------------------------------------------------
  // 6️⃣ SYNC STUDENT ON CREATE
  // --------------------------------------------------
 if (newLead.leadstatus === "Student") {
  let student = await Student.findOne({ leadid: newLead._id });

  if (!student) {
    student = await Student.create({
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email,
      collegename:newLead.collegename,
      location: newLead.location,
      category: newLead.category,
      leadsource: newLead.leadsource,
      domain: newLead.domain,
      graduate: newLead.graduate,
      leadstatus: newLead.leadstatus,
      dateofjoin:newLead.dateofjoin,
      feetype:newLead.feetype,
      leadid: newLead._id,
      fees: Number(newLead.fees) || 0,
      feepaid: Number(newLead.feepaid) || 0,
      pendingfee:
      (Number(newLead.fees) || 0) -
      (Number(newLead.feepaid) || 0),
      assignto:newLead.assignto,
      lookingfor:newLead.lookingfor,
      internshipduration:newLead.internshipduration

    });
     
    console.log("student data:",student);
    // ✅ log creation
    await Studentlog.create({
      studentid: student._id,
      action: "create",
     
      source: "lead_create",
      updatedby: req.user?._id
    });
    
    console.log("Student and student log created");
  }
}



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

console.log(data);

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
    // const needsAssign =
    //   payload.leadstatus === "Demo Scheduled" ||
    //   payload.leadstatus === "Student";

    // if (!needsAssign) {
    //   delete payload.assignfrom;
    //   delete payload.assignto;
    // } else {
    //   // remove invalid values
    //   if (!payload.assignfrom || payload.assignfrom === "N/A") {
    //     delete payload.assignfrom;
    //   }
    //   if (!payload.assignto || payload.assignto === "N/A") {
    //     delete payload.assignto;
    //   }

    //   // convert name → ObjectId
    //   if (payload.assignfrom && typeof payload.assignfrom === "string") {
    //     const fromUser = await User.findOne({ name: payload.assignfrom });
    //     if (fromUser) payload.assignfrom = fromUser._id;
    //   }

    //   if (payload.assignto && typeof payload.assignto === "string") {
    //     const toUser = await User.findOne({ name: payload.assignto });
    //     if (toUser) payload.assignto = toUser._id;
    //   }
    // }
    if (!payload.assignfrom || !mongoose.Types.ObjectId.isValid(payload.assignfrom)) {
      payload.assignfrom = null;
    }

    if (!payload.assignto || !mongoose.Types.ObjectId.isValid(payload.assignto)) {
      payload.assignto = null;
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
       { $set: payload },
      { new: true, runValidators: true }
    )
      .populate("assignfrom", "name email role")
      .populate("assignto", "name email role")
      .lean();


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
    // const existingStudent = await Student.findOne({ leadId: updatedLead._id });
    // if (existingStudent) {
    //   await Student.findOneAndUpdate(
    //     { leadId: updatedLead._id },
    //     updatedLead,
    //     { new: true }
    //   );
    // }

const existingStudent = await Student.findOne({
  leadid: updatedLead._id
});



// CASE 1: leadstatus → Student (CREATE)
if (updatedLead.leadstatus === "Student" && !existingStudent) {

  const studentData = {
    name: updatedLead.name,
    phone: updatedLead.phone,
    email: updatedLead.email,
    collegename: updatedLead.collegename,
    location: updatedLead.location,
    category: updatedLead.category,
    leadsource: updatedLead.leadsource,
    domain: updatedLead.domain,
    graduate: updatedLead.graduate,
    leadstatus: updatedLead.leadstatus,

    lookingfor: updatedLead.lookingfor,
    internshipduration: updatedLead.internshipduration,
    noofday: updatedLead.noofday,
    dateofjoin: updatedLead.dateofjoin,
    assignto:updatedLead.assignto,
    feetype: updatedLead.feetype,
    fees: Number(updatedLead.fees) || 0,
    feepaid: Number(updatedLead.feepaid),
    pendingfee:
      (Number(updatedLead.fees) || 0) -
      (Number(updatedLead.feepaid) || 0),

    leadid: updatedLead._id
  };

  const student = await Student.create(studentData);
  console.log("student data upadte:",student);

  // ✅ CREATE log (oldvalue = null)
  const changes = Object.keys(studentData).map(key => ({
    field: key,
    oldvalue: null,
    newvalue: studentData[key]
  }));

  await Studentlog.create({
    studentid: student._id,
    action: "create",
    changes,
    source: "lead_update",
    updatedby: req.user?._id
  });
}


// CASE 2: student already exists (UPDATE)

// if (existingStudent) {

//   const updateData = {
//     name: updatedLead.name,
//     phone: updatedLead.phone,
//     email: updatedLead.email,
//     collegename: updatedLead.collegename,
//     location: updatedLead.location,
//     category: updatedLead.category,
//     leadsource: updatedLead.leadsource,
//     domain: updatedLead.domain,
//     graduate: updatedLead.graduate,

//     lookingfor: updatedLead.lookingfor,
//     internshipduration: updatedLead.internshipduration,
//     noofday: updatedLead.noofday,
//     dateofjoin: updatedLead.dateofjoin,

//     feetype: updatedLead.feetype,
//     fees: Number(updatedLead.fees) || existingStudent.fees,
//     feepaid: Number(updatedLead.feepaid) || existingStudent.feepaid
//   };

//   // 🔹 recalc pending fee in backend
//   updateData.pendingfee = updateData.fees - updateData.feepaid;

//   // 🔹 detect changes BEFORE update
//   const changes = detectChanges(existingStudent.toObject(), updateData);

//   const updatedStudent = await Student.findByIdAndUpdate(
//     existingStudent._id,
//     updateData,
//     { new: true }
//   );

//   // 🔹 log only if changed
//   if (changes.length > 0) {

//     const feeFields = ["fees", "feepaid", "pendingfee"];
//     const isPayment =
//       changes.every(c => feeFields.includes(c.field));

//     await Studentlog.create({
//       studentid: updatedStudent._id,
//       action: isPayment ? "payment" : "update",
//       changes,
//       source: "lead_update",
//       updatedby: req.user?._id
//     });
//   }
// }


    // --------------------------------------------------
    // 6️⃣ CREATE DEAL / STUDENT IF NEEDED
    // --------------------------------------------------
    if (updatedLead.leadstatus === "Demo Scheduled" && !existingDeal) {
      await Deal.create({ ...updatedLead, leadId: updatedLead._id });
    }

    // if (updatedLead.leadstatus === "Student" && !existingStudent) {
    //   await Student.create({ ...updatedLead, leadId: updatedLead._id });
    // }

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
