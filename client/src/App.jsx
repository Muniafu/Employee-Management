import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
//import Home from './pages/Home';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public routes */}
          {/*<Route path="/" element={<Home />} /> */}
          <Route path="/" element={<Login />} />
          
          {/* Protected user routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          {/* Admin-only routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminRoute />
              </PrivateRoute>
            }
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

// Helper component for admin route protection
const AdminRoute = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      {/* Additional admin sub-routes can be added here */}
    </Routes>
  );
};

export default App;