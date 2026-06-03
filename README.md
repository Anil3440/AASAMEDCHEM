# AASA MedChem — Inventory & Order Management System

A full-stack MERN hackathon MVP for managing laboratory chemical/medical supply inventory and seller orders — with role-based access, INR pricing, and automatic unit conversion.

---

## Features

| Role | Capabilities |
|------|-------------|
| **Admin** | Dashboard stats · Full product CRUD · View all orders · Update order status |
| **Seller** | Browse & search products · Add to cart · Live price preview · Place orders · View own order history |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Vite), Tailwind CSS v4, React Router v7, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB via Mongoose |
| Auth | JWT (stored in localStorage), bcryptjs |

---

## MongoDB Schema Design

### Why Embedded Items in `Order`?
Order items are embedded as a sub-document array rather than referenced. This is intentional:
- **Snapshot immutability**: Prices and product names are captured at order time. Future edits to a product don't rewrite history.
- **Single DB read**: Fetching an order returns everything — no joins needed.
- **Appropriate scale**: For a hackathon MVP with hundreds of orders, embedded documents are perfectly efficient.

### Schemas

**User** — `name · email (unique) · password (hashed) · role (admin|seller)`

**Product** — `name · sku (unique) · description · category · baseUnit (g|mL|unit) · basePrice (₹ per base unit) · stockQuantity (in base unit)`

**Order** — `userId · status (pending|confirmed|cancelled) · notes · totalPrice · createdAt · items[]`

Each **Order Item** snapshot: `productId · productName · orderedUnit · orderedQuantity · baseQuantity · unitPrice · totalPrice`

---

## Unit Storage Strategy

All quantities are stored and computed in **base units**:

| Measure | Base Unit | Accepted Input |
|---------|-----------|---------------|
| Weight | `g` (grams) | g, kg |
| Volume | `mL` (millilitres) | mL, L |
| Count | `unit` | unit |

### Conversion Factors
```js
{ g: 1, kg: 1000, mL: 1, L: 1000, unit: 1 }
```

### Example
> User orders **2 kg** of Sodium Chloride (basePrice = ₹0.05/g)
>
> `baseQty = 2 × 1000 = 2000 g`  
> `total = 2000 × 0.05 = ₹100.00`

### Why `Number` Type?
MongoDB's `Number` (IEEE 754 double) supports up to 15–16 significant digits. For quantities up to 100,000 g and prices up to ₹9,999 — this is more than sufficient for this scale. No `Decimal128` needed.

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install backend
```bash
cd backend
npm install
```

### 2. Configure environment
Edit `backend/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/aasamedchem
JWT_SECRET=aasa_secret_key_2024
PORT=5000
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start backend
```bash
npm run dev
```
> Server runs on http://localhost:5000

### 5. Install & start frontend
```bash
cd ../frontend
npm install
npm run dev
```
> App runs on http://localhost:5173

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password |
| Seller | seller@demo.com | password |

---

## Panel Usage Guide

### Admin Panel (`/admin`)
1. **Dashboard** — Live counts of products, pending orders, and unique sellers
2. **Products** (`/admin/products`) — Add products via modal (name, SKU, category, base unit, price, stock). Edit or delete with confirmation.
3. **Orders** (`/admin/orders`) — Click **View** to expand item details with unit conversion. Use the status dropdown to update pending → confirmed/cancelled.

### Seller Panel (`/seller`)
1. **Browse** (`/seller`) — Search bar filters by name or category live. Click **Add to Cart** on any product.
2. **Cart** (right sidebar) — Select unit (g/kg, mL/L, unit), enter quantity, see live price preview. Add notes, click **Place Order**.
3. **My Orders** (`/seller/orders`) — View order history with status badge. Expand each order to see item breakdown and unit conversions.

---

## Project Structure

```
root/
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── .env
│   ├── config/db.js
│   ├── models/         User · Product · Order
│   ├── routes/         auth · product · order
│   ├── controllers/    auth · product · order
│   ├── middleware/     auth.middleware.js
│   └── utils/          units.js (CommonJS)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx · App.jsx
        ├── api/        axios.js
        ├── context/    AuthContext.jsx
        ├── utils/      units.js (ESM)
        └── pages/
            ├── Login.jsx
            ├── admin/  Dashboard · Products · Orders
            └── seller/ Browse · MyOrders
```
