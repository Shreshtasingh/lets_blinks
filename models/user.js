const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Address Schema
const AddressSchema = new mongoose.Schema({
  state: { type: String, required: true },
  zip: { type: Number, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
});

// Create the Address model
const addressModel = mongoose.model('Address', AddressSchema);

// Joi Address validation schema
const validateAddress = (address) => {
  const addressSchema = Joi.object({
    state: Joi.string().required(),
    zip: Joi.number().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
  });
  return addressSchema.validate(address, { abortEarly: false }); // Returns all validation errors
};

// Mongoose User Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String,  minlength: 6, maxlength: 100 },
    phone: {
      type: String, // Using string to handle exactly 10 digits
      
      validate: {
        validator: (v) => /^\d{10}$/.test(v), // Ensure it's exactly 10 digits
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    addresses: { type: [AddressSchema], required: true }, // Embedding AddressSchema
  },
  { timestamps: true }
);

// Create the User model
const userModel = mongoose.model('User', UserSchema);

// Joi User validation schema
const validateUser = (user) => {
  const userValidationSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    phone: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be exactly 10 digits.",
      }),
    addresses: Joi.array().items(
      Joi.object({
        state: Joi.string().required(),
        zip: Joi.number().required(),
        city: Joi.string().required(),
        address: Joi.string().required(),
      })
    ).required(),
  });
  return userValidationSchema.validate(user, { abortEarly: false }); // Returns all validation errors
};

// Export Address model, User model, and their validation functions
module.exports = {
  addressModel,
  validateAddress,
  userModel,
  validateUser,
};
