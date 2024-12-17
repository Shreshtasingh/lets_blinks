const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'editor'], // Restrict roles to specific values
    required: true,
  },
 
});

// Mongoose Model
const adminModel = mongoose.model('Admin', AdminSchema);

// Joi Validation Schema
const validateAdmin = (admin) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('superadmin', 'admin', 'editor').required(),
  });
  return schema.validate(admin, { abortEarly: false });
};

// Export Model and Validation Function
module.exports = { adminModel, validateAdmin };
