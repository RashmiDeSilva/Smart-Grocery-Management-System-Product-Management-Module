const mongoose = require('mongoose');
const Product = require('../models/Product');

// Helper to determine risk level dynamically
const updateProductRisk = (product) => {
    const remainingQty = product.stock || 0;
    if (remainingQty <= 0) {
        product.riskLevel = "LOW";
        product.riskAction = "Sold out";
        product.riskProbability = 0;
    } else {
        // Heuristic: If stock > reorderLevel * 2.5, it is HIGH risk, else LOW.
        const reorder = product.reorderLevel || 10;
        if (remainingQty > reorder * 2.5) {
            product.riskLevel = "HIGH";
            product.riskAction = "CRITICAL: Urgent discount required";
            product.riskProbability = Number(Math.min(2.5, remainingQty / (reorder * 2)).toFixed(2));
        } else {
            product.riskLevel = "LOW";
            product.riskAction = "SAFE: No action needed";
            product.riskProbability = Number(Math.min(0.99, remainingQty / (reorder * 3.5)).toFixed(2));
        }
    }
};

// Helper to find by MongoDB ID or productId string
const findProductByIdOrCode = async (idStr) => {
    let product = null;
    if (mongoose.Types.ObjectId.isValid(idStr)) {
        product = await Product.findById(idStr);
    }
    if (!product) {
        product = await Product.findOne({ productId: idStr });
    }
    return product;
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single product
exports.getProductById = async (req, res) => {
    try {
        const product = await findProductByIdOrCode(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a product
exports.createProduct = async (req, res) => {
    const product = new Product({
        productName: req.body.productName,
        description: req.body.description,
        mainCategory: req.body.mainCategory,
        subCategory: req.body.subCategory,
        supplier: req.body.supplier,
        costPrice: req.body.costPrice,
        sellingPrice: req.body.sellingPrice,
        reorderLevel: req.body.reorderLevel,
        imageUrl: req.body.imageUrl,
        stock: req.body.stock || 0,
        sold: req.body.sold || 0,
        discount: req.body.discount || 'No active discount'
    });

    updateProductRisk(product);

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const product = await findProductByIdOrCode(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (req.body.productName) product.productName = req.body.productName;
        if (req.body.description) product.description = req.body.description;
        if (req.body.mainCategory) product.mainCategory = req.body.mainCategory;
        if (req.body.subCategory) product.subCategory = req.body.subCategory;
        if (req.body.supplier) product.supplier = req.body.supplier;
        if (req.body.costPrice !== undefined) product.costPrice = req.body.costPrice;
        if (req.body.sellingPrice !== undefined) product.sellingPrice = req.body.sellingPrice;
        if (req.body.reorderLevel !== undefined) product.reorderLevel = req.body.reorderLevel;
        if (req.body.imageUrl !== undefined) product.imageUrl = req.body.imageUrl;
        if (req.body.stock !== undefined) product.stock = req.body.stock;
        if (req.body.sold !== undefined) product.sold = req.body.sold;
        if (req.body.discount !== undefined) product.discount = req.body.discount;
        if (req.body.isArchived !== undefined) {
            const wasArchived = product.isArchived;
            product.isArchived = req.body.isArchived;
            if (product.isArchived && !wasArchived) {
                product.archivedDate = req.body.archivedDate || new Date();
                product.archiveReason = req.body.archiveReason || 'Other';
            } else if (!product.isArchived) {
                product.archivedDate = null;
                product.archiveReason = "";
            }
        }

        updateProductRisk(product);

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await findProductByIdOrCode(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
