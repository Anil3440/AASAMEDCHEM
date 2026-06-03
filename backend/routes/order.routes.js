const express = require('express');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.put('/:id', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
