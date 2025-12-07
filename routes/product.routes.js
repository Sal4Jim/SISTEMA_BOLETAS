const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct } = require('../controllers/product.controller');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);

module.exports = router;