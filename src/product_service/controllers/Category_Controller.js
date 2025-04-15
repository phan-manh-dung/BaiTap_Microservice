const categoryService = require('../services/Category_Service');

// Handler để lấy tất cả các categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Handler để lấy category theo ID
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await categoryService.getCategoryById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Handler để tạo một category mới
const createCategory = async (req, res) => {
    try {
        const categoryData = req.body; 
        const newCategory = await categoryService.createCategory(categoryData);
        res.status(201).json({
            message: 'Category created successfully',
            category: newCategory,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error creating category',
            error: error.message,
        });
    }
};

// Phương thức cập nhật Category
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;  
        const categoryData = req.body;    

        const updatedCategory = await categoryService.updateCategory(categoryId, categoryData);

        res.status(200).json({
            message: 'Category updated successfully',
            category: updatedCategory,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error updating category',
            error: error.message,
        });
    }
};

// Phương thức xóa Category
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;  

        const deletedCategory = await categoryService.deleteCategory(categoryId);

        res.status(200).json({
            message: 'Category deleted successfully',
            category: deletedCategory,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error deleting category',
            error: error.message,
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
