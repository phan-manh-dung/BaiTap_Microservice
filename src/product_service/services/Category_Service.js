const Category = require('../models/Category_Model');

// Lấy tất cả các category
const getAllCategories = async () => {
    try {
        const categories = await Category.find();
        return categories;
    } catch (error) {
        throw new Error('Error retrieving categories');
    }
};

// Lấy category theo id
const getCategoryById = async (id) => {
    try {
        const category = await Category.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    } catch (error) {
        throw new Error('Error retrieving category by id');
    }
};

// Tạo một category mới
const createCategory = async (categoryData) => {
    try {
        const newCategory = new Category(categoryData);
        await newCategory.save();
        return newCategory;
    } catch (error) {
        throw new Error('Error creating category');
    }
};

//update category
const updateCategory = async (categoryId, categoryData) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, categoryData, {
            new: true,  
            runValidators: true, 
        });

        if (!updatedCategory) {
            throw new Error('Category not found');
        }

        return updatedCategory;
    } catch (error) {
        throw new Error('Error updating category: ' + error.message);
    }
};

const deleteCategory = async (categoryId) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            throw new Error('Category not found');
        }

        return deletedCategory;
    } catch (error) {
        throw new Error('Error deleting category: ' + error.message);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
