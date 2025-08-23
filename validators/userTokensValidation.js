const { body, param } = require("express-validator");
const { validationResult } = require("express-validator");
const { error } = require("../utils/response");
const { RESPONSE_CODES } = require("../utils/helper");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
if (!errors.isEmpty()) return error(res, errors.array()[0].msg, RESPONSE_CODES.VALIDATION_ERROR, 422);
  next();
};



exports.generateTokenValidation = [
  body("user_id").notEmpty().withMessage("user_id is required"),
  body("token_type").isIn(["app", "api"]).withMessage("token_type must be app or api"),
  handleValidation,
];

exports.TokenchangeStatusValidation = [
  param("id").isInt({ gt: 0 }).withMessage("Invalid token ID"),
  body("status").isIn(["Active", "Inactive"]).withMessage("status must be Active or Inactive"),
  handleValidation,
];
