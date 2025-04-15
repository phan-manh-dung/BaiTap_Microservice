const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        address: { type: String, required: true },
        phone: {
            type: String,
            required: true,
            unique: true,
            match: [/^\+?\d{10,15}$/, 'Please fill a valid phone number'],
        },
        email: { type: String, required: true, unique: true },
        website: { type: String },
        status: { type: String, enum: ['verified', 'unverified'], require: true, default: 'unverified' },
    },
    {
        timestamps: true,
    },
);

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
