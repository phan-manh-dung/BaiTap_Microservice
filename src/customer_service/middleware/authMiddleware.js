const jwt = require('jsonwebtoken');
// const { User, Account } = require('../../user_service/model/UserModel');
const { User, Account } = require('../model/UserModel');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Token is missing',
      status: 'ERROR',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    // Kiểm tra thời gian hết hạn
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        message: 'Token has expired',
        status: 'ERROR',
      });
    }

    // Lấy thông tin User từ decoded token , populate dùng để lấy data liên kết account từ user
    const user = await User.findById(decoded.id).populate('account');
    if (!user || !user.account) {
      return res.status(403).json({
        message: 'Access denied: User or account not found',
        status: 'ERROR',
      });
    }

    // Lấy thông tin account và kiểm tra quyền ADMIN
    const account = await Account.findById(user.account);
    const isAdmin = account.roles.some((role) => role.name === 'ADMIN');
    if (isAdmin || decoded.id === req.params.id) {
      req.user = user; // Gán thông tin user vào req để dùng trong các middleware khác nếu cần
      next();
    } else {
      return res.status(403).json({
        message: 'Access denied: You are not an admin',
        status: 'ERROR',
      });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({
      message: 'Internal server error',
      status: 'ERROR',
    });
  }
};

const authMiddlewareUpdate = (req, res, next) => {
  const token = req.headers.token.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        message: 'The author 1 err verify',
        status: 'ERR',
      });
    }
    if (user?.isAdmin) {
      next();
    } else if (user?.id) {
      next();
    } else {
      return res.status(404).json({
        message: 'The author user err',
        status: 'ERR',
      });
    }
  });
};

module.exports = {
  authMiddleware,
  authMiddlewareUpdate,
};
