const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/Inventory_Controller');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/get-all', inventoryController.getAllInventory);
router.get('/get-by-id/:id', inventoryController.getInventoryById);

router.post('/admin/create',authMiddleware, inventoryController.createInventory);
router.put('/admin/update/:id', authMiddleware, inventoryController.updateInventory);
router.delete('/admin/delete/:id', authMiddleware, inventoryController.deleteInventory);

module.exports = router;
