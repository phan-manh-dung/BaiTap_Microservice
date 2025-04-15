const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema(
    {
        quantity: { type: Number, min: [0, ''], required: true },
        minimumStockLevel: { type: Number, required: true, default: 5 },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
