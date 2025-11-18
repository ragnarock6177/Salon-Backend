export const sendSuccess = (res, message, data = {}, code = 200) => {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'Something went wrong', code = 500, errors = []) => {
  return res.status(code).json({
    success: false,
    message,
    errors,
  });
};
