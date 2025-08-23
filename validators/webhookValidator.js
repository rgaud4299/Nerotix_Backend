const { body, param, query, validationResult } = require('express-validator');

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const first = result.array()[0];
      return res.status(422).json({ success: false, message: first.msg, errors: result.array() });
    }
    next();
  },
];



exports.update = validate([
  body("url")
    .optional({ checkFalsy: true }) 
    .custom((value) => {
      if (value && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value)) {
        throw new Error("Invalid webhook URL");
      }
      return true;
    }),

  body("user_id")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("User ID must be a string"),

]);