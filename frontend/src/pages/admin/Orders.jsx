import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { formatINR } from '../../utils/units';

const STATUS_STYLES = {
  pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  confirmed: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  cancelled: 'bg-red-900/50 text-red-300 border-red-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${STATUS_STYLES[status] || ''}`}>
      {status}
    </span>
  );
}

export default function AdminOrders() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try { const { data } = await api.get('/orders'); setOrders(data); }
    catch { /* ignore */ }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 text-sm transition">← Dashboard</Link>
          <span className="text-slate-500">•</span>
          <span className="text-white font-semibold">Orders</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">All Orders</h1>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">Order #</th>
                  <th className="text-left px-4 py-3 font-medium">Seller</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-500">No orders yet.</td></tr>
                )}
                {orders.map((order) => (
                  <>
                    <tr key={order._id} className="border-b border-slate-700/50 hover:bg-slate-750 transition">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-white">{order.userId?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{formatINR(order.totalPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-indigo-700 text-xs text-slate-300 hover:text-white transition">
                            {expandedId === order._id ? 'Hide' : 'View'}
                          </button>
                          <select
                            value={order.status}
                            disabled={updating === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded item details */}
                    {expandedId === order._id && (
                      <tr key={`${order._id}-expanded`} className="bg-slate-850">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                            {order.notes && (
                              <p className="text-slate-400 text-sm mb-3">
                                <span className="text-slate-500">Notes:</span> {order.notes}
                              </p>
                            )}
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-slate-500 border-b border-slate-700">
                                  <th className="text-left pb-2 font-medium">Product</th>
                                  <th className="text-left pb-2 font-medium">Ordered</th>
                                  <th className="text-left pb-2 font-medium">Base Qty</th>
                                  <th className="text-left pb-2 font-medium">Unit Price</th>
                                  <th className="text-right pb-2 font-medium">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item, i) => (
                                  <tr key={i} className="border-b border-slate-800">
                                    <td className="py-2 text-white">{item.productName}</td>
                                    <td className="py-2 text-slate-300">
                                      {item.orderedQuantity} {item.orderedUnit}
                                    </td>
                                    <td className="py-2">
                                      <span className="text-indigo-400 font-mono text-xs">
                                        {item.orderedQuantity} {item.orderedUnit} = {item.baseQuantity} {item.orderedUnit === 'kg' ? 'g' : item.orderedUnit === 'L' ? 'mL' : item.orderedUnit}
                                      </span>
                                    </td>
                                    <td className="py-2 text-slate-400">{formatINR(item.unitPrice)}/base</td>
                                    <td className="py-2 text-right text-emerald-400 font-semibold">{formatINR(item.totalPrice)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
