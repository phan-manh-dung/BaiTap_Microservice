const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// const GATEWAY_URL = 'http://localhost:5555';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Gọi user_service qua Gateway để xác thực token
    const response = await axios.get(`${process.env.GATEWAY_URL}/api/user/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = response.data;
    if (!userData || !userData.data) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = userData.data; // Lưu thông tin user vào req
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message, error.response?.data);
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

module.exports = { authMiddleware };
