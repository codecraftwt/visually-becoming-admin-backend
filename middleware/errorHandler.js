exports.errorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || err.status || 500
  });
  
  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://admin.visuallybecoming.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  
  const statusCode = err.statusCode || err.status || 500;
  
  // In production, don't expose full error details
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? (err.message || "Internal Server Error")
    : err.message || "Internal Server Error";
  
  res.status(statusCode).json({ 
    error: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
