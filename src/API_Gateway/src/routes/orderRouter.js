const express = require('express');
const router = express.Router();
const ServiceClient = require('../services/serviceClient');
const orderServiceClient = new ServiceClient('order_service');
// Middleware verify token
const authenticateToken = require('../middleware/authenMiddleware');

const { readData, createData } = require('../../redis/v1/service/redisService');

const errorHandler = (error, res) => {
  console.error('Service Error:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || 'Internal Server Error';
  res.status(status).json({ success: false, message, error: error.message });
};

router.use((req, res, next) => {
  // Bỏ qua xác thực cho API đăng nhập
  if (req.path === '/update-status') {
    return next();
  }
  authenticateToken(req, res, next);
});

router.post('/create-order', async (req, res) => {
  try {
    const response = await orderServiceClient.postAuth('/api/order/create-order', req.body, {
      Authorization: req.headers.authorization,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

// có redis
router.get('/get-detail-order/:id', async (req, res) => {
  try {
    const cacheKey = `cart-user-detail:${req.params.id}`;
    const cachedData = await readData(cacheKey).catch(() => null);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    const response = await orderServiceClient.get(`/api/order/get-detail-order/${req.params.id}`, req.body);
    const data = response.data;
    await createData(cacheKey, data, 3600);
    console.log(`Cache created for key: ${cacheKey}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/admin/get-all-order', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        message: 'Token is missing at API Gateway router',
        status: 'ERROR',
      });
    }
    const response = await orderServiceClient.getAuth('/api/order/admin/get-all-order', token);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling user service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

router.patch('/cancel-order/:id', async (req, res) => {
  try {
    const response = await orderServiceClient.patch(`/api/order/cancel-order/${req.params.id}`);
    if (!response.data) {
      return res.status(500).json({
        message: 'Invalid response from order service',
        status: 'ERROR',
      });
    }
    res.status(response.status).json(response.data);
  } catch (error) {
    console.log('Error when calling order service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

router.get('/get-all-order-user/:id', async (req, res) => {
  try {
    const cacheKey = `cart-all-one-user:${req.params.id}:${req.query.statusOrder || ''}`;
    const cachedData = await readData(cacheKey).catch(() => null);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    const response = await orderServiceClient.get(
      `/api/order/get-all-order-user/${req.params.id}?statusOrder=${req.query.statusOrder || ''}`,
    );
    const data = response.data;
    await createData(cacheKey, data, 3600);
    console.log(`Cache created for key: ${cacheKey}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.put('/update-status', async (req, res) => {
  try {
    const response = await orderServiceClient.put(`/api/order/update-status`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error when calling order service:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

module.exports = router;
