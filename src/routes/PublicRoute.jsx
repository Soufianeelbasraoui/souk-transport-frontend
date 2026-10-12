import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'TRANSPORTEUR') {
      return <Navigate to="/transporteur/dashboard" replace />;
    }
    if (user.role === 'EXPEDITEUR') {
      return <Navigate to="/expediteur/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;