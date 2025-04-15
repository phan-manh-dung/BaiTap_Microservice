const Supplier = require('../models/Supplier_Model'); 
// Tạo mới Supplier
const createSupplier = async (supplierData) => {
    try {
        const newSupplier = new Supplier(supplierData);
        await newSupplier.save();
        return newSupplier;
    } catch (error) {
        throw new Error('Error creating supplier: ' + error.message);
    }
};

// Lấy tất cả Suppliers
const getAllSuppliers = async () => {
    try {
        return await Supplier.find();
    } catch (error) {
        throw new Error('Error fetching suppliers: ' + error.message);
    }
};

// Lấy một Supplier theo ID
const getSupplierById = async (supplierId) => {
    try {
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            throw new Error('Supplier not found');
        }
        return supplier;
    } catch (error) {
        throw new Error('Error fetching supplier: ' + error.message);
    }
};

// Cập nhật thông tin Supplier
const updateSupplier = async (supplierId, supplierData) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(supplierId, supplierData, {
            new: true,
            runValidators: true,
        });
        if (!updatedSupplier) {
            throw new Error('Supplier not found');
        }
        return updatedSupplier;
    } catch (error) {
        throw new Error('Error updating supplier: ' + error.message);
    }
};

// Xóa Supplier
const deleteSupplier = async (supplierId) => {
    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
        if (!deletedSupplier) {
            throw new Error('Supplier not found');
        }
        return deletedSupplier;
    } catch (error) {
        throw new Error('Error deleting supplier: ' + error.message);
    }
};

module.exports = { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier };
