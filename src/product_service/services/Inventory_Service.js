const Inventory = require('../models/Inventory_Model');

class InventoryService {
    // Lấy danh sách tồn kho
    async getAllInventory() {
        return await Inventory.find();
    }

    // Lấy thông tin tồn kho theo ID
    async getInventoryById(id) {
        return await Inventory.findById(id);
    }

    // Thêm mới tồn kho
    async createInventory(data) {
        const newInventory = new Inventory(data);
        return await newInventory.save();
    }

    // Cập nhật tồn kho theo ID
    async updateInventory(id, data) {
        return await Inventory.findByIdAndUpdate(id, data, { new: true });
    }

    // Xóa tồn kho theo ID
    async deleteInventory(id) {
        return await Inventory.findByIdAndDelete(id);
    }
}

module.exports = new InventoryService();
