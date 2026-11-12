// components/PrivateRouteAdmin.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRouteAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = localStorage.getItem('role');

  if (!user || role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
