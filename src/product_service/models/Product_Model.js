const mongoose = require('mongoose');
const Inventory = require('./Inventory_Model');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: [0, 'Price must be a positive number'] },
    description: { type: String, required: true },
    computer: {
      brand: { type: String, required: true },
      series: {type: String},
      ram: { type: Number, required: true },
      type: { type: String, enum: ['PC', 'LAPTOP', 'LAPTOP GAMING'], required: true },
      storage: { type: Number, required: true },
      graphic_card: { type: String },
      processor: { type: String, required: true },
      battery_life: { type: Number },
      os: { type: String, required: true },
    },
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  },
  { timestamps: true },
);

// Middleware để tạo Inventory trước khi lưu Product
productSchema.pre("save", async function (next) {
    if (!this.inventory) { 
        try {
            const newInventory = new Inventory({ quantity: 0 }); 
            await newInventory.save();
            this.inventory = newInventory._id; 
        } catch (error) {
            return next(error);
        }
    }
    next();
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
