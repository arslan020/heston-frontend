import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ProtectedRoute({ children, allowRoles }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    api.me().then(user => setState({ loading: false, user })).catch(() => setState({ loading: false, user: null }));
  }, []);

  if (state.loading) return <div style={{ padding: 24 }}>Checking session…</div>;
  if (!state.user || !allowRoles.includes(state.user.role)) return <Navigate to="/" replace />;
  return children;
}
