const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Product Schema
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Ensure product name is always provided
      
    },
    price: {
      type: Number,
      required: true, // Ensure price is always provided
      min: 0, // Price must be a positive number
    },
    category: {
      type: String,
      required: true, // Ensure category is always provided
    },
    stock: {
        type: Number,
        required: true, // Ensure stock status is always provided
    },

    description: {
      type: String,
     
    },
   image: {
      type: Buffer,
      required: true, // Ensure image URL is always provided
    },
   // image: Joi.any(), // No specific validation for binary data

  }
);

// Mongoose Model
const productModel = mongoose.model('Product', productSchema);

// Joi Validation Function for Product
const validateProduct = (product) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      ,
    price: Joi.number()
      .min(0)
      .required(),
      
    category: Joi.string()
      .required()
     ,
      stock: Joi.number()
      .min(0)
      .required(),
      
    description: Joi.string() ,
   /* image: Joi.string()
      
      .messages({
        'string.base': 'Image must be a valid string.',
        'string.uri': 'Image must be a valid URL.',
        'any.required': 'Image URL is required.',
      }),*/
      image: Joi.any().optional(),

  });

  return schema.validate(product, { abortEarly: false }); // Returns all validation errors
};

// Export Mongoose Model and Joi Validation Function
module.exports = { productModel, validateProduct };
