const express = require('express');
const categoryController = require('../controllers/Category_Controller');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route để lấy tất cả các categories
router.get('/get-all', categoryController.getAllCategories);

// Route để lấy category theo id
router.get('/get-by-id/:id', categoryController.getCategoryById);

// Route để tạo một category mới
router.post('/admin/create', authMiddleware, categoryController.createCategory);

router.put('/admin/update/:id',authMiddleware, categoryController.updateCategory);

router.delete('/admin/delete/:id',authMiddleware, categoryController.deleteCategory);

module.exports = router;
