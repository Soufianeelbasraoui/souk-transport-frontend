import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/common/Skeleton';

export const RoleRoute = ({ roles, children }) => {
  const { user, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton height={28} width="30%" />
        <Skeleton height={180} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;