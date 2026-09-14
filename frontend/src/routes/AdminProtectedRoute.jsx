import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RefreshCw } from 'lucide-react';

export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Verifying admin session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
