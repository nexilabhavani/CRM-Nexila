

import Lead from "../models/Lead.js"; // ✅ add this import
import { validationResult } from "express-validator";


// Create lead
export const createLead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const data = req.body;
    data.createdBy = req.user._id;
    const lead = new Lead(data);
    await lead.save();
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Update lead
export const updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const payload = req.body;
    payload.updatedAt = Date.now();
    const updated = await Lead.findByIdAndUpdate(leadId, payload, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Delete lead
export const deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Lead deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Get single lead
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignFrom assignTo createdBy', 'name email role');
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// List leads with optional filters, pagination and search
export const listLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, q, status, assignedTo } = req.query;
    const filter = {};

    // If employee (not admin), show only leads assigned to them or created by them
    if (req.user.role !== 'admin') {
      filter.$or = [{ assignTo: req.user._id }, { createdBy: req.user._id }];
    } else {
      // admin can filter by assignedTo
      if (assignedTo) filter.assignTo = assignedTo;
    }

    if (q) {
      const re = new RegExp(q, 'i');
      filter.$or = filter.$or || [];
      filter.$or.push({ name: re }, { email: re }, { phone: re }, { collegeName: re }, { domain: re });
    }
    if (status) filter.leadStatus = status;

    const leads = await Lead.find(filter)
      .populate('assignFrom assignTo createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(filter);
    res.json({ leads, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
