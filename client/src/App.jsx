import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './tailwind.css';
import { AuthProvider } from './Context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import AdminDashboard from './Dashboard/Admin/Pages/AdminDashboard';
import EmployeeDashboard from './Dashboard/Employee/Pages/EmployeeDashboard';

import Login from './User/Pages/Login';
import Register from './User/Pages/Register';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute requiredRole="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            
            {/* Fallback Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all  for invalid routes*/}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;