import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { formatINR } from '../../utils/units';

const EMPTY = { name: '', sku: '', description: '', category: '', baseUnit: 'g', basePrice: '', stockQuantity: '' };

function PageHeader({ logout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 text-sm transition">← Dashboard</Link>
        <span className="text-slate-500">•</span>
        <span className="text-white font-semibold">Products</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm">{user?.name}</span>
        <button onClick={() => { logout(); navigate('/'); }}
          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
          Logout
        </button>
      </div>
    </header>
  );
}

export default function AdminProducts() {
  const { logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku || '', description: p.description || '',
      category: p.category || '', baseUnit: p.baseUnit, basePrice: p.basePrice, stockQuantity: p.stockQuantity });
    setEditId(p._id); setError(''); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); fetchProducts(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editId) { await api.put(`/products/${editId}`, form); }
      else { await api.post('/products', form); }
      setShowModal(false); fetchProducts();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const field = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-slate-900">
      <PageHeader logout={logout} />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <button id="add-product-btn" onClick={openAdd}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
            + Add Product
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Base Unit</th>
                  <th className="text-right px-4 py-3 font-medium">Stock</th>
                  <th className="text-right px-4 py-3 font-medium">Price/unit</th>
                  <th className="text-center px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-500">No products yet. Add one!</td></tr>
                )}
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-slate-700/50 hover:bg-slate-750 transition">
                    <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.sku || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{p.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 text-xs font-medium">{p.baseUnit}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">{p.stockQuantity.toLocaleString()} {p.baseUnit}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                      {formatINR(p.basePrice)}/{p.baseUnit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-indigo-700 text-slate-300 hover:text-white text-xs transition">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-red-700 text-slate-300 hover:text-white text-xs transition">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-5">{editId ? 'Edit Product' : 'Add Product'}</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              {[['name','Name','text',true],['sku','SKU','text',false],['category','Category','text',false],['description','Description','text',false]].map(([k,l,t,req]) => (
                <div key={k}>
                  <label className="block text-slate-300 text-sm mb-1">{l}</label>
                  <input type={t} required={req} value={form[k]} onChange={(e) => field(k, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Base Unit</label>
                  <select value={form.baseUnit} onChange={(e) => field('baseUnit', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="g">g (grams)</option>
                    <option value="mL">mL (millilitres)</option>
                    <option value="unit">unit (pieces)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Price per base unit (₹)</label>
                  <input type="number" required min="0" step="0.001" value={form.basePrice} onChange={(e) => field('basePrice', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-1">Stock Quantity ({form.baseUnit})</label>
                <input type="number" required min="0" value={form.stockQuantity} onChange={(e) => field('stockQuantity', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
                  {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
