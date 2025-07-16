// src/middlewares/validateHeaders.js
const validateHeaders = (req, res, next) => {
  const requiredHeaders = [
    "x-api-key",
    // "x-client-id",
    "x-product-id",
    "x-user-id",
    "x-request-id",
    //'x-program-id',
    // "x-client-name",
    // 'x-request-id',
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !req.headers[header.toLowerCase()]
  );

  if (missingHeaders.length > 0) {
    return res.status(400).json({
      message: `Missing required headers: ${missingHeaders.join(", ")}`,
    });
  }

  next(); // Proceed to the next middleware or controller
};

module.exports = validateHeaders;
