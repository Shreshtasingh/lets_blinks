const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Order Schema
const orderSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true, // Ensure user ID is always provided
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true, // Ensure product IDs are always provided
    },
  ],
  totalPrice: {
    type: Number,
    required: true, // Ensure total price is always provided
    min: 0, // Total price must be a positive number
  },
  address: {
    type: String,
   
    minlength: 10, // Minimum address length
  },
  status: {
    type: String,
    required: true, // Ensure order status is always provided
    enum: ['pending', 'ordered', 'delivered', 'shipped'], // Valid statuses
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'payment',
    required: true, // Ensure payment details are always provided
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'delivery',
    required: true, // Ensure delivery details are always provided
  },
});

// Mongoose Model
const orderModel = mongoose.model('Order', orderSchema);

// Joi Validation Function for Order
const validateOrder = (order) => {
  const schema = Joi.object({
    user: Joi.string().required().messages({
      'string.base': 'User ID must be a valid string.',
      'any.required': 'User ID is required.',
    }),
    products: Joi.array().items(Joi.string()).required().messages({
      'array.base': 'Products must be an array of valid product IDs.',
      'any.required': 'Products are required.',
    }),
    totalPrice: Joi.number().min(0).required().messages({
      'number.base': 'Total price must be a valid number.',
      'number.min': 'Total price cannot be negative.',
      'any.required': 'Total price is required.',
    }),
    address: Joi.string().min(10).required().messages({
      'string.base': 'Address must be a valid string.',
      'string.min': 'Address must be at least 10 characters long.',
      'any.required': 'Address is required.',
    }),
    status: Joi.string()
      .valid('pending', 'ordered', 'delivered', 'shipped')
      .required()
      .messages({
        'string.base': 'Status must be a valid string.',
        'any.required': 'Status is required.',
        'any.only': 'Status must be one of the following: "pending", "ordered", "delivered", "shipped".',
      }),
    payment: Joi.string().required().messages({
      'string.base': 'Payment ID must be a valid string.',
      'any.required': 'Payment ID is required.',
    }),
    delivery: Joi.string().required().messages({
      'string.base': 'Delivery ID must be a valid string.',
      'any.required': 'Delivery ID is required.',
    }),
  });

  return schema.validate(order, { abortEarly: false }); // Returns all validation errors
};

// Export Mongoose Model and Joi Validation Function
module.exports = { orderModel, validateOrder };
