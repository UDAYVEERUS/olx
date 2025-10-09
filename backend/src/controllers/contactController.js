const Contact = require('../models/Contact');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// Submit contact form
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return sendError(res, 400, 'All fields are required');
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return sendError(res, 400, 'Please provide a valid 10-digit phone number');
  }

  const contact = await Contact.create({
    name,
    email,
    phone,
    subject,
    message,
    user: req.user?._id || null
  });

  sendResponse(res, 201, { contact }, 'Thank you for contacting us! We will get back to you soon.');
});

// Get all contacts (Admin)
const getAllContacts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [contacts, total] = await Promise.all([
    Contact.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Contact.countDocuments(filter)
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  };

  sendResponse(res, 200, { contacts, pagination }, 'Contact submissions retrieved successfully');
});

// Get single contact (Admin)
const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id).populate('user', 'name email phone');

  if (!contact) {
    return sendError(res, 404, 'Contact submission not found');
  }

  sendResponse(res, 200, { contact }, 'Contact submission retrieved successfully');
});

// Update contact status (Admin)
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['new', 'in-progress', 'resolved'].includes(status)) {
    return sendError(res, 400, 'Invalid status');
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!contact) {
    return sendError(res, 404, 'Contact submission not found');
  }

  sendResponse(res, 200, { contact }, 'Contact status updated successfully');
});

// Delete contact (Admin)
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);

  if (!contact) {
    return sendError(res, 404, 'Contact submission not found');
  }

  sendResponse(res, 200, null, 'Contact submission deleted successfully');
});

module.exports = {
  submitContactForm,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
};