const express = require('express');
const paymentController = require('../controller/PaymentController');
const router = express.Router();

router.post('/create-payment-momo', paymentController.createPayment);
router.post('/callback', paymentController.handleCallback);
router.post('/transaction-status-momo', paymentController.checkTransactionStatus);
router.get('/status', paymentController.streamPaymentStatus);

module.exports = router;
