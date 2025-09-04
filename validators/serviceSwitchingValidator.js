
// File: serviceSwitchingValidator.js

const { body, param } = require('express-validator');
const { handleValidation, idParamRule, idBodyRule, StatusRule,optionalStatusRule } = require('./commonValidators');

// Common rules (specific to this file)
const apiIdRule = idBodyRule('api_id', 'API ID must be a positive integer');
const productIdRule = idBodyRule('product_id', 'Product ID must be a positive integer');
const apiCodeRule = body('api_code')
  .trim()
  .notEmpty().withMessage('API code is required')
  .isLength({ max: 50 }).withMessage('API code must be at most 50 characters');
const rateRule = body('rate')
  .notEmpty().withMessage('Rate is required')
  .matches(/^\d+(\.\d+)?$/).withMessage('Rate must be a valid number');
const commissionRule = body('commission_surcharge')
  .notEmpty().withMessage('Commission/Surcharge is required')
  .isLength({ max: 50 }).withMessage('Commission/Surcharge must be at most 50 characters');
const flatPerRule = body('flat_per')
  .notEmpty().withMessage('Flat/Per is required')
  .isIn(['flat', 'percent']).withMessage('Flat/Per must be either flat or percent');
const gstRule = body('gst')
  .notEmpty().withMessage('GST is required')
  .isInt({ min: 0 }).withMessage('GST must be a non-negative integer');
const tdsRule = body('tds')
  .notEmpty().withMessage('TDS is required')
  .isInt({ min: 0 }).withMessage('TDS must be a non-negative integer');
const txnLimitRule = body('txn_limit')
  .notEmpty().withMessage('Transaction limit is required')
  .isInt({ gt: 0 }).withMessage('Transaction limit must be a positive integer');

// Validators
const addServiceSwitchingValidation = [
  apiIdRule,
  productIdRule,
  apiCodeRule,
  rateRule,
  commissionRule,
  flatPerRule,
  gstRule,
  tdsRule,
  txnLimitRule,
  StatusRule(),
  handleValidation
];

const updateServiceSwitchingValidation = [
  idParamRule(),
  apiIdRule,
  productIdRule,
  apiCodeRule,
  rateRule,
  commissionRule,
  flatPerRule,
  gstRule,
  tdsRule,
  txnLimitRule,
  StatusRule(),
  handleValidation
];

const deleteServiceSwitchingValidation = [idParamRule(), handleValidation];

const changeServiceSwitchingStatusValidation = [
  idParamRule(),
  optionalStatusRule('status'),
  handleValidation
];

module.exports = {
  addServiceSwitchingValidation,
  updateServiceSwitchingValidation,
  deleteServiceSwitchingValidation,
  changeServiceSwitchingStatusValidation
};