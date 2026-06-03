const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getProducts);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
