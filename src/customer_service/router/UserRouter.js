const express = require('express');
const userController = require('../controller/UserController');
const { authMiddleware } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const { User } = require('../model/UserModel');
const router = express.Router();

router.post('/sign-up', userController.createUser);
router.post('/sign-in', userController.loginUser);
router.post('/refresh-token', userController.refreshToken);
router.post('/log-out', userController.logUotUser);

router.delete('/admin/delete-user/:id', authMiddleware, userController.deleteUser);
router.get('/admin/get-all', authMiddleware, userController.getAllUser);
router.get('/get-detail/:id', userController.getDetailsUser);
router.put('/update-user/:id', userController.updateUser);

router.get('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json({ status: 'OK', message: 'Token valid', data: user });
  } catch (error) {
    console.error('User service verify-token - Error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
