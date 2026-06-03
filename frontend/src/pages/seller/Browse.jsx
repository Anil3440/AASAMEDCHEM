import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { UNIT_OPTIONS, UNIT_FACTORS, formatINR, calculatePrice } from '../../utils/units';

export default function SellerBrowse() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // [{product, unit, quantity}]
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products', { params: { search } });
        setProducts(data);
      } catch { /* ignore */ }
    };
    fetchProducts();
  }, [search]);

  const addToCart = (product) => {
    const alreadyIn = cart.find((c) => c.product._id === product._id);
    if (alreadyIn) return;
    const defaultUnit = UNIT_OPTIONS[product.baseUnit][0];
    setCart((prev) => [...prev, { product, unit: defaultUnit, quantity: '1' }]);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((c) => c.product._id !== productId));
  };

  const updateCartItem = (productId, field, value) => {
    setCart((prev) => prev.map((c) =>
      c.product._id === productId ? { ...c, [field]: value } : c
    ));
  };

  const getItemTotal = (item) => {
    const qty = parseFloat(item.quantity);
    if (!qty || qty <= 0) return 0;
    return calculatePrice(qty, item.unit, item.product.basePrice);
  };

  const cartTotal = cart.reduce((sum, item) => sum + getItemTotal(item), 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setOrderError('');
    setPlacing(true);
    try {
      const items = cart.map((c) => ({
        productId: c.product._id,
        orderedUnit: c.unit,
        orderedQuantity: parseFloat(c.quantity),
      }));
      await api.post('/orders', { items, notes });
      setSuccess('Order placed successfully!');
      setCart([]);
      setNotes('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-white font-semibold">AASA MedChem</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-sm">Browse Inventory</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/seller/orders" id="my-orders-link" className="text-emerald-400 hover:text-emerald-300 text-sm transition">My Orders</Link>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-900/40 border border-emerald-700 text-emerald-300 font-medium">
            ✅ {success}
          </div>
        )}

        <div className="flex gap-6">
          {/* Left: Product list */}
          <div className="flex-1 min-w-0">
            <div className="mb-5">
              <input
                id="product-search"
                type="text"
                placeholder="Search products by name or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.length === 0 && (
                <p className="text-slate-500 col-span-2 py-10 text-center">No products found.</p>
              )}
              {products.map((p) => {
                const inCart = cart.some((c) => c.product._id === p._id);
                const displayUnit = UNIT_OPTIONS[p.baseUnit][0];
                const displayPrice = p.basePrice * (UNIT_FACTORS[displayUnit] || 1);
                return (
                  <div key={p._id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{p.name}</h3>
                        <p className="text-slate-500 text-xs">{p.category} • SKU: {p.sku || '—'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 text-xs shrink-0">{p.baseUnit}</span>
                    </div>
                    {p.description && <p className="text-slate-400 text-xs">{p.description}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <span className="text-emerald-400 font-semibold">{formatINR(displayPrice)}/{displayUnit}</span>
                        <span className="text-slate-500 text-xs ml-2">Stock: {p.stockQuantity.toLocaleString()} {p.baseUnit}</span>
                      </div>
                      <button
                        id={`add-to-cart-${p._id}`}
                        onClick={() => addToCart(p)}
                        disabled={inCart}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition
                          bg-emerald-700 hover:bg-emerald-600 text-white
                          disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                        {inCart ? 'In Cart ✓' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="w-80 shrink-0">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sticky top-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                🛒 Cart <span className="text-slate-500 text-sm font-normal">({cart.length} items)</span>
              </h2>

              {cart.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-6">Your cart is empty.</p>
              )}

              <div className="space-y-3">
                {cart.map((item) => {
                  const qty = parseFloat(item.quantity);
                  const itemTotal = getItemTotal(item);
                  const unitOptions = UNIT_OPTIONS[item.product.baseUnit] || [item.product.baseUnit];
                  const pricePerSelectedUnit = item.product.basePrice * (UNIT_FACTORS[item.unit] || 1);

                  return (
                    <div key={item.product._id} className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white text-xs font-semibold leading-tight">{item.product.name}</p>
                        <button onClick={() => removeFromCart(item.product._id)}
                          className="text-slate-500 hover:text-red-400 text-xs transition ml-2 shrink-0">✕</button>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <input
                          type="number"
                          min="0.001"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(item.product._id, 'quantity', e.target.value)}
                          className="w-20 px-2 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => updateCartItem(item.product._id, 'unit', e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>

                      <div className="text-xs text-slate-400">
                        <span>{formatINR(pricePerSelectedUnit)}/{item.unit}</span>
                        <span className="mx-1 text-slate-600">•</span>
                        <span className="text-emerald-400 font-semibold">{formatINR(itemTotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cart.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total</span>
                    <span className="text-white font-bold text-lg">{formatINR(cartTotal)}</span>
                  </div>
                  <textarea
                    id="order-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes (optional)…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                  {orderError && (
                    <p className="text-red-400 text-xs">{orderError}</p>
                  )}
                  <button
                    id="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm transition"
                  >
                    {placing ? 'Placing…' : 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
