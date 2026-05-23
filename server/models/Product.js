const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        unique: true,
        required: true,
        default: () => 'PRD' + Math.floor(1000 + Math.random() * 9000)
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    mainCategory: {
        type: String,
        required: [true, 'Main category is required'],
        trim: true
    },
    subCategory: {
        type: String,
        required: [true, 'Sub category is required'],
        trim: true
    },
    supplier: {
        type: String,
        required: [true, 'Supplier is required'],
        trim: true
    },
    costPrice: {
        type: Number,
        required: [true, 'Cost price is required'],
        min: 0
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: 0
    },
    reorderLevel: {
        type: Number,
        required: [true, 'Reorder level is required'],
        min: 0,
        default: 10
    },
    stock: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        default: ''
    },
    riskLevel: {
        type: String,
        default: 'LOW'
    },
    riskProbability: {
        type: Number,
        default: 0
    },
    riskAction: {
        type: String,
        default: 'No action needed'
    },
    sold: {
        type: Number,
        default: 0
    },
    discount: {
        type: String,
        default: 'No active discount'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedDate: {
        type: Date,
        default: null
    },
    archiveReason: {
        type: String,
        trim: true,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);

