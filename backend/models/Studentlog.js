// models/studentlog.js
const mongoose = require("mongoose");

const StudentlogSchema = new mongoose.Schema({
    studentid: {type: mongoose.Schema.Types.ObjectId,ref: "student",required: true},
  action: {
    type: String,
    enum: ["create", "update", "payment"],
    required: true
  },

 changes: [
      {
        field: { type: String, required: true },

        oldvalue: { type: mongoose.Schema.Types.Mixed },

        newvalue: { type: mongoose.Schema.Types.Mixed },
      },
    ],

  updatedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  source: {
    type: String,
    enum: ["lead_create", "lead_update", "student_edit"],
    required: true
  },
    createdAt: { type: Date, default: Date.now },
      
}, {timestamps:true});

module.exports = mongoose.model("Studentlog", StudentlogSchema);
