const { RESPONSE_CODES } = require("../utils/helper");
const { success, error } = require("../utils/response");

const { validationResult } = require("express-validator");

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res,errors.array()[0].msg,RESPONSE_CODES.VALIDATION_ERROR,422 );
  }
  next();
};


