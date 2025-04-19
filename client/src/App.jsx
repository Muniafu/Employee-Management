import React from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './layouts/ProtectedRoute';
import EmployeeLayout from './layouts/EmployeeLayout';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
//import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <AuthProvider>
          <div className="App">
            <Navbar />
            <ToastContainer />
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* protected Employee Routes */}
              <Route element={<ProtectedRoute roles={['employee']} />}>
                <Route path="/employee" element={<EmployeeLayout />}>
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                </Route>
              </Route>
              {/* protected Admin Routes */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
              </Route>
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
      </AuthProvider>
    </Router>
  );
}

export default App;