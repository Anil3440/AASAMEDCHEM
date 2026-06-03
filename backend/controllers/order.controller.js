const Order = require('../models/Order');
const Product = require('../models/Product');
const { UNIT_FACTORS } = require('../utils/units');

const createOrder = async (req, res) => {
  try {
    const { items, notes } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ message: 'Order must have at least one item' });

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ message: `Product not found: ${item.productId}` });

      const factor = UNIT_FACTORS[item.orderedUnit] || 1;
      const baseQuantity = parseFloat(item.orderedQuantity) * factor;
      const itemTotal = baseQuantity * product.basePrice;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        orderedUnit: item.orderedUnit,
        orderedQuantity: parseFloat(item.orderedQuantity),
        baseQuantity,
        unitPrice: product.basePrice,
        totalPrice: itemTotal,
      });

      totalPrice += itemTotal;
    }

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      notes: notes || '',
      totalPrice,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Order.find().populate('userId', 'name email');
    } else {
      query = Order.find({ userId: req.user.id });
    }
    const orders = await query.sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
