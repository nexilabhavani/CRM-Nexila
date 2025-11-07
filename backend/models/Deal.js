const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String },
  phone: { type: String },
  category: { type: String },
  leadsource: { type: String },
  location: { type: String },
  assignfrom: { type: String },
  assignto: { type: String },
  date: { type: String },
  time: { type: String },
  leadstatus: {
    type: String,
  },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
