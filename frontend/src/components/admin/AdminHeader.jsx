import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Database, Activity, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminHeader() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/knowledge-entries', label: 'Knowledge Base', icon: Database },
    { to: '/admin/query-log', label: 'Query Audit Log', icon: Activity },
  ];

  return (
    <div className="bg-white border-b border-slate-200 mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Back to Public Site"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Admin Workspace</h2>
            <p className="text-xs text-slate-500">
              Logged in as <span className="font-mono text-slate-700">{user?.email || 'admin@wastewise.org'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors ml-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
