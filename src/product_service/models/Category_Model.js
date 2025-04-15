const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        image: {
            type: String,
            required: true,
            match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, 'Please provide a valid image URL'],
        },
    },
    {
        timestamps: true,
    },
);
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
