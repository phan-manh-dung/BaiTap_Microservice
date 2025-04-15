const express = require('express');
const router = express.Router();
const ServiceClient = require('../services/serviceClient');
const paymentServiceClient = new ServiceClient('payment_service');
// Middleware verify token
const authenticateToken = require('../middleware/authenMiddleware');
// lỗi
const errorHandler = (error, res) => {
  console.error('Service Error:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || 'Internal Server Error';
  res.status(status).json({ success: false, message, error: error.message });
};

router.post('/create-payment-momo', async (req, res) => {
  try {
    const response = await paymentServiceClient.post('/api/payment/create-payment-momo', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post('/callback', async (req, res) => {
  console.log('Gateway received callback:', req.body);
  try {
    const response = await paymentServiceClient.post('/api/payment/callback', req.body);
    console.log('Callback response:', response.data);
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post('/transaction-status-momo', async (req, res) => {
  try {
    const response = await paymentServiceClient.post('/api/payment/transaction-status-momo', req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/status', async (req, res) => {
  try {
    const response = await productServiceClient.get('/api/payment/status', {
      params: req.query,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;
