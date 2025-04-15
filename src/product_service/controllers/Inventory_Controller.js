const InventoryService = require('../services/Inventory_Service');

const getAllInventory = async (req, res) => {
    try {
        const inventory = await InventoryService.getAllInventory();
        res.status(200).json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

const getInventoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await InventoryService.getInventoryById(id);

        if (!inventory) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        res.status(200).json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

const createInventory = async (req, res) => {
    try {
        const { quantity, minimumStockLevel } = req.body;
        const newInventory = await InventoryService.createInventory({ quantity, minimumStockLevel });

        res.status(201).json({ success: true, data: newInventory });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Bad Request', error: error.message });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInventory = await InventoryService.updateInventory(id, req.body);

        if (!updatedInventory) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        res.status(200).json({ success: true, data: updatedInventory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedInventory = await InventoryService.deleteInventory(id);

        if (!deletedInventory) {
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        }

        res.status(200).json({ success: true, message: 'Inventory deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAllInventory,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory,
};
