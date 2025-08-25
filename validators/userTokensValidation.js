const { body, param } = require("express-validator");
const { handleValidation } = require("../utils/handleValidation");



exports.generateTokenValidation = [
  body("token_type").isIn(["app", "api"]).withMessage("token_type must be app or api"),
  handleValidation,
];

exports.TokenchangeStatusValidation = [
  param("id").isInt({ gt: 0 }).withMessage("Invalid token ID"),
  body("status").isIn(["Active", "Inactive"]).withMessage("status must be Active or Inactive"),
  handleValidation,
];
