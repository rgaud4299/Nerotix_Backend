const { RESPONSE_CODES } = require('./helper');
function success(res, message, data = null, statusCode = RESPONSE_CODES.SUCCESS) {
  return res.status(200).json({
    success: true,
    statusCode,
    message,
    ...(data !== null ? { data } : {})
  });
}

function error(res, message, statusCode = RESPONSE_CODES.FAILED, httpCode = 500) {
  return res.status(httpCode).json({
    success: false,
    statusCode,
    message
  });
}


function successGetAll(res, message, data = [], total = 0, filteredCount = 0, statusCode =  RESPONSE_CODES.SUCCESS) {
  return res.status(200).json({
    success: true,
    statusCode,
    message,
    recordsTotal: total,
    recordsFiltered: filteredCount,
    data
  });
}


module.exports = { success, error,successGetAll };
