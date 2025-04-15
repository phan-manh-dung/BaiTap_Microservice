const supplierService = require('../services/Supplier_Service'); 

// Tạo mới Supplier
const createSupplier = async (req, res) => {
    try {
        const supplierData = req.body;
        const newSupplier = await supplierService.createSupplier(supplierData);
        res.status(201).json({
            message: 'Supplier created successfully',
            supplier: newSupplier,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error creating supplier',
            error: error.message,
        });
    }
};

// Lấy tất cả Suppliers
const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(400).json({
            message: 'Error fetching suppliers',
            error: error.message,
        });
    }
};

// Lấy một Supplier theo ID
const getSupplierById = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const supplier = await supplierService.getSupplierById(supplierId);
        res.status(200).json(supplier);
    } catch (error) {
        res.status(400).json({
            message: 'Error fetching supplier',
            error: error.message,
        });
    }
};

// Cập nhật thông tin Supplier
const updateSupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const supplierData = req.body;
        const updatedSupplier = await supplierService.updateSupplier(supplierId, supplierData);
        res.status(200).json({
            message: 'Supplier updated successfully',
            supplier: updatedSupplier,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error updating supplier',
            error: error.message,
        });
    }
};

// Xóa Supplier
const deleteSupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const deletedSupplier = await supplierService.deleteSupplier(supplierId);
        res.status(200).json({
            message: 'Supplier deleted successfully',
            supplier: deletedSupplier,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error deleting supplier',
            error: error.message,
        });
    }
};

module.exports = { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier };
