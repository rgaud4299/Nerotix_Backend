// File: utils/commonValidators.js

const { body, param, validationResult } = require("express-validator");
const { error } = require("../utils/response");
const { RESPONSE_CODES } = require("../utils/helper");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, errors.array()[0].msg, RESPONSE_CODES.VALIDATION_ERROR, 422);
  }
  next();
};

// const idParamRule = (name = 'id', msg = 'Valid positive numeric ID is required') => param(name)
//    .matches(/^[1-9][0-9]*$/) 
//     .withMessage(msg)
//     .customSanitizer((value) => BigInt(value)); 

const idParamRule = (
  name = "id",
  msg = "Valid positive numeric ID is required"
) =>
  param(name).custom((value, { req }) => {
    if (!/^[1-9][0-9]*$/.test(value)) {
      throw new Error(msg); // 
    }
    req.params[name] = BigInt(value); // ✅ valid -> convert to BigInt
    return true;
  });


const idBodyRule = (name = 'id', msg = 'Valid positive numeric ID is required') =>
  body(name)
    .matches(/^[1-9][0-9]*$/)
    .withMessage(msg)
    .customSanitizer((value) => {
      try {
        return BigInt(value);
      } catch {
        return value; 
      }
    });


const requiredStringRule = (name, msg = `${name} is required`) => body(name)
  .trim()
  .notEmpty().withMessage(msg);

const optionalStringRule = (name, msg = `${name} must be a string`) => body(name)
  .optional()
  .isString().withMessage(msg);

const StatusRule = (name = 'status', msg = `${name} must be either 'Active' or 'Inactive'`) => body(name)
  .optional()
  .isIn(['Active', 'Inactive'])
  .withMessage(msg);

const optionalStatusRule = (name = 'status', msg = `${name} must be either 'Active' or 'Inactive'`) => body(name)
  .optional()
  .isIn(['Active', 'Inactive'])
  .withMessage(msg);

const requiredYesNoRule = (name, msg = `${name} must be either 'Yes' or 'No'`) => body(name)
  .notEmpty().withMessage(`${name} is required`)
  .isIn(['Yes', 'No']).withMessage(msg);

const otpRule = (name = 'otp', length = 6) => body(name)
  .notEmpty().withMessage(`${name} is required`)
  .isNumeric().withMessage(`${name} must be a numeric value`)
  .isLength({ min: length, max: length }).withMessage(`${name} must be exactly ${length} digits`);

const ipAddressRule = (name = 'ip_address') => body(name)
  .notEmpty().withMessage('IP Address is required')
  .isIP().withMessage('Must be a valid IP address (IPv4 or IPv6)')
  .isLength({ max: 45 }).withMessage('IP Address must not exceed 45 characters');

const tokenTypeRule = (name = 'token_type') => body(name)
  .notEmpty().withMessage('Token type is required')
  .isIn(['app', 'api']).withMessage('Token type must be app or api');

const signatureTypeRule = (name = 'signature_type') => body(name)
  .notEmpty().withMessage('Signature type is required')
  .isIn(['SMS', 'Whatsapp']).withMessage('Signature type must be SMS or Whatsapp');

const userIdParamRule = (name = 'user_id', msg = 'Valid positive numeric user ID is required') => param(name)
  .isInt({ gt: 0 }).withMessage(msg);

const userIdBodyRule = (name = 'user_id', msg = 'Valid positive numeric user ID is required') => body(name)
  .notEmpty().withMessage(`${name} is required`)
  .isInt({ gt: 0 }).withMessage(msg);

const textRule = (field, max) => body(field)
  .optional()
  .isString().withMessage(`${field} must be a string`)
  .isLength({ max }).withMessage(`${field} must be at most ${max} characters`)
  .trim();

const idParamValid = [idParamRule(), handleValidation];
// middleware/convertId.js





module.exports = {
  handleValidation,
  idParamRule,
  idBodyRule,
  requiredStringRule,
  optionalStringRule,
  StatusRule,
  optionalStatusRule,
  requiredYesNoRule,
  otpRule,
  ipAddressRule,
  tokenTypeRule,
  signatureTypeRule,
  userIdParamRule,
  userIdBodyRule,
  idParamValid,
  textRule,
};