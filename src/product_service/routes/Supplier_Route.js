const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/Supplier_Controller');
const { authMiddleware } = require('../middleware/authMiddleware');

// Lấy tất cả Suppliers
router.get('/get-all', supplierController.getAllSuppliers);

// Lấy Supplier theo ID
router.get('/get-by-id/:id', supplierController.getSupplierById);

//Tạo mới Supplier
router.post('/admin/create', authMiddleware, supplierController.createSupplier);

//  Cập nhật thông tin Supplier
router.put('/admin/update/:id', authMiddleware, supplierController.updateSupplier);

//  Xóa Supplier
router.delete('/admin/delete/:id', authMiddleware, supplierController.deleteSupplier);

module.exports = router;


