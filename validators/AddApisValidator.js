const { check, body } = require("express-validator");
const { validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// 🔹 Change Status Validation
exports.changeStatusValidation = [
  check("auto_status_check")
    .notEmpty()
    .withMessage("auto_status_check is required")
    .isIn(["Active", "Inactive"])
    .withMessage("auto_status_check must be either 'Active' or 'Inactive'"),
  handleValidation,
];

// 🔹 Create API Validation
exports.addApiValidation = [
  check("api_name").notEmpty().withMessage("API name is required"),
  handleValidation,
];

// 🔹 Update API Validation
exports.updateAuthValidation = [
  body("api_name").optional().isString().withMessage("API name must be a string"),
  body("api_type").optional().isString().withMessage("API type must be a string"),
  body("remain_balance").optional().isFloat().withMessage("Remain balance must be numeric"),
  body("pending_txn_limit").optional().isInt().withMessage("Pending txn limit must be an integer"),
  body("auto_status_check")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("auto_status_check must be either 'Active' or 'Inactive'"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be either 'Active' or 'Inactive'"),
  handleValidation,
];


exports.updatekeyvalueValidation = [
  body("auth_key1").optional().isString().withMessage("auth_key1 must be string"),
  body("auth_value1").optional().isString().withMessage("auth_value1 must be string"),
  body("auth_key2").optional().isString().withMessage("auth_key2 must be string"),
  body("auth_value2").optional().isString().withMessage("auth_value2 must be string"),
  body("auth_key3").optional().isString().withMessage("auth_key3 must be string"),
  body("auth_value3").optional().isString().withMessage("auth_value3 must be string"),
  body("auth_key4").optional().isString().withMessage("auth_key4 must be string"),
  body("auth_value4").optional().isString().withMessage("auth_value4 must be string"),
  body("auth_key5").optional().isString().withMessage("auth_key5 must be string"),
  body("auth_value5").optional().isString().withMessage("auth_value5 must be string"),
  body("auth_key6").optional().isString().withMessage("auth_key6 must be string"),
  body("auth_value6").optional().isString().withMessage("auth_value6 must be string"),
  handleValidation,
];