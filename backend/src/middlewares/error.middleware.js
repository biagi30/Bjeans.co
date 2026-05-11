function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const response = {
    success: false,
    message: err.message || "Internal Server Error"
  };

  if (err.name === "CastError") {
    response.message = "Invalid resource id";
    return res.status(400).json(response);
  }

  if (err.name === "ValidationError") {
    response.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    return res.status(400).json(response);
  }

  if (err.code === 11000) {
    response.message = "Duplicate field value";
    return res.status(400).json(response);
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  notFound,
  errorHandler
};
