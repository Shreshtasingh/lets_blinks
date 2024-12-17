const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Cart Schema
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true, // Ensure a user ID is always provided
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Referencing the product model
      required: true, // Ensure each product ID is valid
    }
  ],
  totalPrice: {
    type: Number,
    required: true, // Ensure totalPrice is always present
    min: 0, // Total price cannot be negative
  },
},
{timestamps: true});

// Mongoose Model
const cartModel = mongoose.model('Cart', cartSchema);

// Joi Validation Function for Cart
const validateCart = (cart) => {
  const schema = Joi.object({
    user: Joi.string().required().messages({
      "string.base": "User ID must be a valid string.",
      "any.required": "User ID is required.",
    }),
    products: Joi.array()
      .items(Joi.string().required())
      .required()
      .messages({
        "array.base": "Products must be an array of valid product IDs.",
        "any.required": "At least one product is required.",
      }),
    totalPrice: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": "Total price must be a number.",
        "number.min": "Total price cannot be negative.",
        "any.required": "Total price is required.",
      }),
  });

  return schema.validate(cart, { abortEarly: false }); // Returns all validation errors
};

// Export Mongoose Model and Joi Validation Function
module.exports = { cartModel, validateCart };
