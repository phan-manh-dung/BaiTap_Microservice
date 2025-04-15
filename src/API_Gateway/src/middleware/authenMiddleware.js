const jwt = require('jsonwebtoken');

// Middleware kiểm tra token
const authenticateToken = (req, res, next) => {
  // Lấy token từ header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Kiểm tra token (thay JWT_SECRET bằng secret key từ user-service)
  const JWT_SECRET = process.env.ACCESS_TOKEN;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    // Token hợp lệ, lưu thông tin decoded vào req
    req.user = decoded; // Ví dụ: decoded chứa userId, role
    next(); // Chuyển tiếp request
  });
};

module.exports = authenticateToken;
