import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (!isAuthenticated && !localStorage.getItem('lp_access_token')) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
