const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication failed. Token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    const message = error.name === 'TokenExpiredError' 
      ? 'Token has expired.' 
      : 'Invalid token.';
    return res.status(401).json({ message });
  }
};


exports.authorizeAdmin = (req, res, next) => {
  // Ensure the user is authenticated and their role is admin
  if (req.user && req.user.role === 'admin') {
    return next(); // User is authorized, proceed to the next middleware or route handler
  }

  return res.status(403).json({ message: 'Access denied. Admins only.' });
};
