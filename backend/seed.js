require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Seed users
    const users = [
      { name: 'Admin User', email: 'admin@demo.com', password: 'password', role: 'admin' },
      { name: 'Demo Seller', email: 'seller@demo.com', password: 'password', role: 'seller' },
    ];

    for (const u of users) {
      u.password = await bcrypt.hash(u.password, 10);
    }
    await User.insertMany(users);
    console.log('Users seeded: admin@demo.com, seller@demo.com (password: password)');

    // Seed products
    const products = [
      {
        name: 'Sodium Chloride',
        sku: 'NaCl-001',
        category: 'Chemicals',
        baseUnit: 'g',
        basePrice: 0.05,
        stockQuantity: 50000,
        description: 'Reagent-grade sodium chloride (NaCl), 99.5% purity',
      },
      {
        name: 'Ethanol',
        sku: 'ETH-001',
        category: 'Solvents',
        baseUnit: 'mL',
        basePrice: 0.8,
        stockQuantity: 20000,
        description: 'Absolute ethanol, 99.9% purity, suitable for lab use',
      },
      {
        name: 'Petri Dish',
        sku: 'PDish-001',
        category: 'Equipment',
        baseUnit: 'unit',
        basePrice: 12.0,
        stockQuantity: 500,
        description: 'Borosilicate glass petri dish, 90mm diameter',
      },
      {
        name: 'Glucose',
        sku: 'GLC-001',
        category: 'Chemicals',
        baseUnit: 'g',
        basePrice: 0.12,
        stockQuantity: 30000,
        description: 'D-Glucose (dextrose), anhydrous, analytical grade',
      },
      {
        name: 'Distilled Water',
        sku: 'DW-001',
        category: 'Solvents',
        baseUnit: 'mL',
        basePrice: 0.05,
        stockQuantity: 100000,
        description: 'Type II laboratory-grade distilled water',
      },
    ];

    await Product.insertMany(products);
    console.log('Products seeded: 5 products added');

    console.log('\n✅ Seed complete! You can now run: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
