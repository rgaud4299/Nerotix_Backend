const { body, param, validationResult } = require("express-validator");

// Common rules
const userIdRule = body("user_id")
  .notEmpty().withMessage("User ID is required")
  .isLength({ max: 50 }).withMessage("User ID must not exceed 50 characters");

const ipAddressRule = body("ip_address")
  .notEmpty().withMessage("IP Address is required")
  .isIP().withMessage("Must be a valid IP address (IPv4 or IPv6)")
  .isLength({ max: 45 }).withMessage("IP Address must not exceed 45 characters");

const statusRule = body("status")
  .optional()
  .isIn(["Active", "Inactive"]).withMessage("Status must be either 'Active' or 'Inactive'");

const idParamRule = param("id")
  .isInt({ gt: 0 }).withMessage("Valid numeric ID is required");
  
const userid= param("user_id").notEmpty().withMessage("User ID is required")


const userIdValidation = param("user_id")
  .notEmpty()
  .withMessage("User ID is required")
  .isInt()
  .withMessage("User ID must be an integer");


// ✅ Centralized validation handler

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: errors.array()[0].msg, // first error only
      
    });
  }
  next();
};

// Validators
const addIpValidation = [
  ipAddressRule,
  statusRule,
  handleValidation
];

const changeStatusValidation = [
  idParamRule,
  statusRule,
  handleValidation
];

const deleteIpValidation = [
  idParamRule,
  handleValidation
];

const getAllIpValidation = [
   userIdValidation,
   handleValidation

];

module.exports = {
  addIpValidation,
  changeStatusValidation,
  deleteIpValidation,
  getAllIpValidation
};
