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

function baseUnitOf(orderedUnit) {
  if (orderedUnit === 'kg') return 'g';
  if (orderedUnit === 'L') return 'mL';
  return orderedUnit;
}

export default function SellerOrders() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch { /* ignore */ }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/seller" className="text-emerald-400 hover:text-emerald-300 text-sm transition">← Browse</Link>
          <span className="text-slate-500">•</span>
          <span className="text-white font-semibold">My Orders</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>

        {orders.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">📋</p>
            <p>No orders yet. <Link to="/seller" className="text-emerald-400 hover:underline">Start shopping →</Link></p>
          </div>
        )}

        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-mono text-xs"># {order._id.slice(-8).toUpperCase()}</span>
                  <span className="text-slate-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-bold">{formatINR(order.totalPrice)}</span>
                  <button
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                    className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 hover:text-white transition"
                  >
                    {expandedId === order._id ? 'Hide' : 'View'}
                  </button>
                </div>
              </div>

              {expandedId === order._id && (
                <div className="border-t border-slate-700 px-5 py-4 bg-slate-900/40">
                  {order.notes && (
                    <p className="text-slate-400 text-sm mb-3"><span className="text-slate-500">Notes:</span> {order.notes}</p>
                  )}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-700">
                        <th className="text-left pb-2 font-medium">Product</th>
                        <th className="text-left pb-2 font-medium">Quantity</th>
                        <th className="text-left pb-2 font-medium">Conversion</th>
                        <th className="text-right pb-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} className="border-b border-slate-800">
                          <td className="py-2 text-white">{item.productName}</td>
                          <td className="py-2 text-slate-300">{item.orderedQuantity} {item.orderedUnit}</td>
                          <td className="py-2">
                            <span className="text-indigo-400 font-mono text-xs">
                              {item.orderedQuantity} {item.orderedUnit} = {item.baseQuantity} {baseUnitOf(item.orderedUnit)}
                            </span>
                          </td>
                          <td className="py-2 text-right text-emerald-400 font-semibold">{formatINR(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
