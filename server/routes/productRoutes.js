const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @route   GET /api/products
// @desc    Get all products
router.get('/', productController.getProducts);

// @route   GET /api/products/:id
// @desc    Get a single product
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// @desc    Create a product
router.post('/', productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
