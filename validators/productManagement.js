

// File: productsAndPricesValidator.js

const { body, param } = require('express-validator');
const { handleValidation, idParamRule, idBodyRule, requiredStringRule, StatusRule } = require("./commonValidators");

// Product Category Validators
const categoryNameRule = requiredStringRule('name', 'Category name is required')
  .isLength({ max: 100 }).withMessage('Category name must be at most 100 characters long');

const categoryStatusRule = StatusRule('status', 'Status must be Active or Inactive')
  .notEmpty().withMessage('Status is required');

const categoryIdParamRule = idParamRule('id', 'Valid Category ID is required');

// Validators
const addProductCategoryValidation = [categoryNameRule, categoryStatusRule, handleValidation];
const updateProductCategoryValidation = [categoryIdParamRule, categoryNameRule, categoryStatusRule, handleValidation];
const deleteCategoryValidation = [categoryIdParamRule, handleValidation];
const changeCategoryStatusValidation = [categoryIdParamRule, categoryStatusRule, handleValidation];


// Product Validators
const productIdParamRule = idParamRule('id', 'Valid product ID is required');
const productCategoryIdRule = idBodyRule('category_id', 'Valid category_id must be a positive integer');
const productNameRule = requiredStringRule('name', 'Product name is required')
  .isLength({ max: 150 }).withMessage('Product name must be at most 150 characters');
const productDescriptionRule = body('description')
  .optional({ nullable: true })
  .trim()
  .isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters');
const productStatusRule = StatusRule('status', 'Status must be Active or Inactive')
  .notEmpty().withMessage('Status is required');

// Validators
const addProductValidation = [
  productCategoryIdRule,
  productNameRule,
  productDescriptionRule,
  productStatusRule,
  handleValidation,
];

const updateProductValidation = [
  productIdParamRule,
  productCategoryIdRule,
  productNameRule,
  productDescriptionRule,
  productStatusRule,
  handleValidation,
];

const changeProductStatusValidation = [
  productIdParamRule,
  productStatusRule,
  handleValidation,
];

const deleteProductValidation = [
  productIdParamRule,
  handleValidation,
];


// Product Price Validators
const allowedCurrencies = ['INR'];
const priceProductIdRule = idBodyRule('product_id', 'Product ID must be a positive integer');
const priceIdParamRule = idParamRule('id', 'Valid Price ID is required');
const priceRule = body('price')
  .notEmpty().withMessage('Price is required')
  .isFloat({ gt: 0 }).withMessage('Price must be a positive number');
const currencyRule = body('currency')
  .notEmpty().withMessage('Currency is required')
  .isString().withMessage('Currency must be a string')
  .isLength({ max: 10 }).withMessage('Currency must be at most 10 characters long')
  .custom(value => {
    if (!allowedCurrencies.includes(value.toUpperCase())) {
      throw new Error(`Currency must be one of: ${allowedCurrencies.join(', ')}`);
    }
    return true;
  });

// Validators
const createProductPriceValidator = [
  priceProductIdRule,
  priceRule,
  currencyRule,
  handleValidation,
];

const updateProductPriceValidator = [
  priceIdParamRule,
  priceRule,
  currencyRule,
  handleValidation,
];

const deleteProductPriceValidator = [
  priceIdParamRule,
  handleValidation,
];

module.exports = {
  // Product Category
  addProductCategoryValidation,
  updateProductCategoryValidation,
  deleteCategoryValidation,
  changeCategoryStatusValidation,

  // Product
  addProductValidation,
  updateProductValidation,
  changeProductStatusValidation,
  deleteProductValidation,

  // Product Price
  createProductPriceValidator,
  updateProductPriceValidator,
  deleteProductPriceValidator,
};