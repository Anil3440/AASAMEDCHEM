import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-slate-800 rounded-xl p-6 border border-slate-700 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, pendingOrders: 0, sellers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders'),
        ]);
        const orders = oRes.data;
        const pending = orders.filter((o) => o.status === 'pending').length;
        const uniqueSellers = new Set(orders.map((o) => o.userId?._id || o.userId)).size;
        setStats({ products: pRes.data.length, pendingOrders: pending, sellers: uniqueSellers });
      } catch {
        // silently fail
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top nav */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-white font-semibold">AASA MedChem</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Welcome, {user?.name}</span>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 text-sm mb-8">Overview of your inventory and orders</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Total Products" value={stats.products} icon="🧪" color="bg-indigo-900/50" />
          <StatCard label="Pending Orders" value={stats.pendingOrders} icon="⏳" color="bg-yellow-900/50" />
          <StatCard label="Total Sellers" value={stats.sellers} icon="👥" color="bg-emerald-900/50" />
        </div>

        {/* Navigation cards */}
        <h2 className="text-lg font-semibold text-white mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/admin/products"
            id="nav-products"
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-600 rounded-xl p-6 group transition"
          >
            <div className="text-2xl mb-3">🧪</div>
            <h3 className="text-white font-semibold text-lg group-hover:text-indigo-400 transition">
              Manage Products
            </h3>
            <p className="text-slate-400 text-sm mt-1">Add, edit, or remove inventory items</p>
          </Link>
          <Link
            to="/admin/orders"
            id="nav-orders"
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-600 rounded-xl p-6 group transition"
          >
            <div className="text-2xl mb-3">📋</div>
            <h3 className="text-white font-semibold text-lg group-hover:text-emerald-400 transition">
              View Orders
            </h3>
            <p className="text-slate-400 text-sm mt-1">Review and update order statuses</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
