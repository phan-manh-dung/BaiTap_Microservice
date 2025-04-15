const Product = require('../models/Product_Model');
const cloudinary = require('../config/cloudinaryConfig')

// Lấy tất cả sản phẩm
const getAllProducts = async () => {
    return await Product.find();
};

// Lấy sản phẩm theo ID
const getProductById = async (productId) => {
    return await Product.findById(productId);
};

// Tạo mới sản phẩm
const createProduct = async (productData, filePath) => {
    try {
        // Upload file lên Cloudinary và lưu vào thư mục "products"
        const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
            folder: 'products',
        });

        // Tạo sản phẩm mới với link ảnh từ Cloudinary
        const newProduct = new Product({
            ...productData,
            image: cloudinaryResponse.secure_url, // Lưu URL ảnh vào database
        });

        await newProduct.save();
        return newProduct;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Cập nhật sản phẩm theo ID
const updateProduct = async (productId, updateData) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
        if (!updatedProduct) {
            throw new Error('Product not found');
        }
        return updatedProduct;
    } catch (error) {
        throw new Error(`Error updating product: ${error.message}`);
    }
};

// Xóa sản phẩm theo ID
const deleteProduct = async (productId) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            throw new Error('Product not found');
        }
        return deletedProduct;
    } catch (error) {
        throw new Error(`Error deleting product: ${error.message}`);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
