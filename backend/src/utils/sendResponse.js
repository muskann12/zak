const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    error: !success ? message : null,
    data,
  });
};

module.exports = sendResponse;