const express = require('express');
const orderController = require('../controller/OrderController');
const { authMiddlewareOrder } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create-order', express.json({ limit: '50mb' }), orderController.createOrder);
router.get('/get-detail-order/:id', orderController.getDetailOrder);
router.patch('/cancel-order/:id', orderController.deleteOrderToCancelled);
// get all order of user(lấy tất cả các đơn order của 1 user)
router.get('/get-all-order-user/:id', orderController.getAllOrderOfUser);
// get order of all user(lấy tất cả order của all user)
router.get('/admin/get-all-order', authMiddlewareOrder, orderController.getAllOrder);
// update status order
router.put('/update-status', orderController.updateStatusOrder);

module.exports = router;
