const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Ensure category name is always provided
    minlength: 3, // Minimum length of category name
    maxlength: 50, // Maximum length of category name
  },
});

// Mongoose Model
const categoryModel = mongoose.model('Category', categorySchema);

// Joi Validation Function for Category
const validateCategory = (category) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      "string.base": "Category name must be a valid string.",
      "string.min": "Category name must be at least 3 characters long.",
      "string.max": "Category name cannot be longer than 50 characters.",
      "any.required": "Category name is required.",
    }),
  });

  return schema.validate(category, { abortEarly: false }); // Returns all validation errors
};

// Export Mongoose Model and Joi Validation Function
module.exports = { categoryModel, validateCategory };
