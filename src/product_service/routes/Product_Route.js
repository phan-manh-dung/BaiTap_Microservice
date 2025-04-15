const express = require('express');
const productController = require('../controllers/Product_Controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs')


const uploadDir = path.join(__dirname, '../uploads');

// Kiểm tra nếu thư mục chưa tồn tại thì tạo
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục lưu file tạm
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file
    }
});
const upload = multer({ storage: storage });



router.get('/get-all', productController.getAllProducts);
router.get('/get-by-id/:id', productController.getProductById);

router.delete('/admin/delete/:id', authMiddleware, productController.deleteProduct);
router.post('/admin/create', authMiddleware, upload.single('image'), productController.createProduct);
router.put('/admin/update/:id', authMiddleware, productController.updateProduct);

module.exports = router;
