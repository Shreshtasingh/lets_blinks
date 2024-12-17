const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Delivery Schema
const deliverySchema = mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: true, // Ensure order ID is always provided
  },
  deliveryBoy: {
    type: String,
    required: true, // Ensure deliveryBoy name is provided
    minlength: 3, // Minimum length for delivery boy's name
    maxlength: 50, // Maximum length for delivery boy's name
  },
  status: {
    type: String,
    required: true, // Ensure status is always provided
    enum: ['pending', 'delivered', 'shipped', 'out for delivery'], // Valid statuses
  },
  trackingUrl: {
    type: String,
  
  },
  estimatedDeliveryTime: {
    type: Number,
    required: true, // Ensure estimated delivery time is provided
    min: 0, // Estimated time cannot be less than 1
  },
});

// Mongoose Model
const deliveryModel = mongoose.model('Delivery', deliverySchema);

// Joi Validation Function for Delivery
const validateDelivery = (delivery) => {
  const schema = Joi.object({
    order: Joi.string().required().messages({
      "string.base": "Order ID must be a valid string.",
      "any.required": "Order ID is required.",
    }),
    deliveryBoy: Joi.string().min(3).max(50).required().messages({
      "string.base": "Delivery boy name must be a valid string.",
      "string.min": "Delivery boy name must be at least 3 characters long.",
      "string.max": "Delivery boy name cannot be longer than 50 characters.",
      "any.required": "Delivery boy name is required.",
    }),
    status: Joi.string().valid('pending', 'delivered', 'shipped', 'out for delivery').required().messages({
      "string.base": "Status must be a valid string.",
      "any.required": "Status is required.",
      "any.only": "Status must be one of the following: 'pending', 'delivered', 'shipped', 'out for delivery'.",
    }),
    trackingUrl: Joi.string().uri().optional().messages({
      "string.uri": "Tracking URL must be a valid URL.",
    }),
    estimatedDeliveryTime: Joi.number().min(1).required().messages({
      "number.base": "Estimated delivery time must be a valid number.",
      "number.min": "Estimated delivery time cannot be less than 1.",
      "any.required": "Estimated delivery time is required.",
    }),
  });

  return schema.validate(delivery, { abortEarly: false }); // Returns all validation errors
};

// Export Mongoose Model and Joi Validation Function
module.exports = { deliveryModel, validateDelivery };
