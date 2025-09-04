// File: validators/authValidator.js

const { body } = require('express-validator');
const { handleValidation, requiredStringRule, otpRule } = require('./commonValidators');

// Register Validation
const registerValidation = [
  requiredStringRule('name', 'Name is required'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character'),

  body('mobile_no')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .isLength({ min: 10, max: 10 }).withMessage('Mobile number must be exactly 10 digits')
    .isNumeric().withMessage('Mobile number must contain only digits'),
  handleValidation,
];

//Login Validation
const loginValidation = [

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude value'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude value'),
  handleValidation,
  
];

//Verify OTP Validation
const verifyOtpValidation = [
  requiredStringRule('tempUserId', 'Temp User ID is required'),
  otpRule('emailOtp'),
  otpRule('mobileOtp'),
  handleValidation,
];

module.exports = {
  registerValidation,
  loginValidation,
  verifyOtpValidation
};