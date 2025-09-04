// File: first-api-validator-file.js

const { check } = require("express-validator");
const { body } = require("express-validator");
const { handleValidation, idParamRule, StatusRule, requiredStringRule, optionalStringRule } = require("./commonValidators");


// 🔹 Change Status Validation
exports.changeStatusValidation = [
  StatusRule('auto_status_check'),
  handleValidation,
];

// 🔹 Create API Validation
exports.addApiValidation = [
  requiredStringRule("api_name", "API name is required"),
  handleValidation,
];

exports.IdParamValidation = [
  idParamRule("id", "Valid numeric ID is required"),
  handleValidation
];


// 🔹 Update API Validation
exports.updateAuthValidation = [
  optionalStringRule("api_name", "API name must be a string"),
  optionalStringRule("api_type", "API type must be a string"),
  body("remain_balance").optional().isFloat().withMessage("Remain balance must be numeric"),
  body("pending_txn_limit").optional().isInt().withMessage("Pending txn limit must be an integer"),
  StatusRule("auto_status_check", "auto_status_check must be either 'Active' or 'Inactive'"),
  StatusRule("status", "Status must be either 'Active' or 'Inactive'"),
  handleValidation,
];


exports.updatekeyvalueValidation = [
  optionalStringRule("auth_key1", "auth_key1 must be string"),
  optionalStringRule("auth_value1", "auth_value1 must be string"),
  optionalStringRule("auth_key2", "auth_key2 must be string"),
  optionalStringRule("auth_value2", "auth_value2 must be string"),
  optionalStringRule("auth_key3", "auth_key3 must be string"),
  optionalStringRule("auth_value3", "auth_value3 must be string"),
  optionalStringRule("auth_key4", "auth_key4 must be string"),
  optionalStringRule("auth_value4", "auth_value4 must be string"),
  optionalStringRule("auth_key5", "auth_key5 must be string"),
  optionalStringRule("auth_value5", "auth_value5 must be string"),
  optionalStringRule("auth_key6", "auth_key6 must be string"),
  optionalStringRule("auth_value6", "auth_value6 must be string"),
  handleValidation,
];

