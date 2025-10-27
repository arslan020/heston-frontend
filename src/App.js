import React from 'react';
import axios from 'axios';                   // ⬅️ add this
axios.defaults.withCredentials = true;       // ⬅️ send cookies with every request
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || '/api';   // ⬅️ optional: centralize API base

import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';



const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/staff-login" element={<StaffLogin />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/staff"
      element={
        <ProtectedRoute allowRoles={['staff']}>
          <StaffDashboard />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
