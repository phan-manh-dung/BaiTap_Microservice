const express = require('express');
const router = express.Router();
const ServiceClient = require('../services/serviceClient');
const cartServiceClient = new ServiceClient('cart_service');
// Middleware verify token
const authenticateToken = require('../middleware/authenMiddleware');

const { readData, createData } = require('../../redis/v1/service/redisService');
// lỗi
const errorHandler = (error, res) => {
  console.error('Service Error:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || 'Internal Server Error';
  res.status(status).json({ success: false, message, error: error.message });
};

router.use(authenticateToken);

router.post('/create-cart', async (req, res) => {
  try {
    const response = await cartServiceClient.post('/api/cart/create-cart', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.delete('/delete-cart/:id', async (req, res) => {
  try {
    const response = await cartServiceClient.delete(`/api/cart/delete-cart/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

router.get('/get-cart/:id', async (req, res) => {
  try {
    const cacheKey = `get-cart-user:${req.params.id}`;
    const cachedData = await readData(cacheKey).catch(() => null);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    const response = await cartServiceClient.get(`/api/cart/get-cart/${req.params.id}`);
    const data = response.data;
    // Lưu vào Redis với TTL là 3600 giây (1 giờ)
    await createData(cacheKey, data, 3600);
    console.log(`Cache created for key: ${cacheKey}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post('/delete-many-cart', async (req, res) => {
  try {
    const response = await cartServiceClient.post('/api/cart/delete-many-cart', req.body);
    console.log('res', response);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Internal server error at API Gateway',
      status: 'ERROR',
    });
  }
});

module.exports = router;
