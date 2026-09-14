import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import WasteIntake from '../pages/WasteIntake';
import AskWasteWise from '../pages/AskWasteWise';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import KnowledgeEntries from '../pages/admin/KnowledgeEntries';
import QueryLog from '../pages/admin/QueryLog';
import AdminProtectedRoute from './AdminProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Endpoints */}
      <Route path="/" element={<Home />} />
      <Route path="/intake" element={<WasteIntake />} />
      <Route path="/ask" element={<AskWasteWise />} />

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <Dashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/knowledge-entries"
        element={
          <AdminProtectedRoute>
            <KnowledgeEntries />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/query-log"
        element={
          <AdminProtectedRoute>
            <QueryLog />
          </AdminProtectedRoute>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
