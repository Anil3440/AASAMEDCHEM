const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, sparse: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  baseUnit: { type: String, enum: ['g', 'mL', 'unit'], required: true },
  basePrice: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
