import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { EmployeeProvider } from "./context/EmployeeProvider";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Dashboard from "./pages/Admin/Dashboard";
import ManageEmployees from "./pages/Admin/ManageEmployees";
import ManageDepartments from "./pages/Admin/ManageDepartments";
import Attendance from "./pages/Admin/Attendance";
import Payroll from "./pages/Admin/Payroll";
import Reports from "./pages/Admin/Reports";

import Profile from "./pages/Employee/Profile";
import LeaveRequest from "./pages/Employee/LeaveRequest";
import AttendanceLog from "./pages/Employee/AttendanceLog";
import Payslips from "./pages/Employee/Payslips";
import Announcements from "./pages/Employee/Announcements";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import "./styles/globals.css";
import "./styles/dashboard.css";

import useAuth from "./hooks/useAuth";

/**
 * Protects routes that require authentication.
 */
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

/**
 * Root App with routing.
 */
function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <Router>
          <div className="dashboard-container">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="dashboard-main">
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/employees"
                    element={
                      <PrivateRoute>
                        <ManageEmployees />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/departments"
                    element={
                      <PrivateRoute>
                        <ManageDepartments />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/attendance"
                    element={
                      <PrivateRoute>
                        <Attendance />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/payroll"
                    element={
                      <PrivateRoute>
                        <Payroll />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <PrivateRoute>
                        <Reports />
                      </PrivateRoute>
                    }
                  />

                  {/* Employee Routes */}
                  <Route
                    path="/employee/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/employee/leave"
                    element={
                      <PrivateRoute>
                        <LeaveRequest />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/employee/attendance"
                    element={
                      <PrivateRoute>
                        <AttendanceLog />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/employee/payslips"
                    element={
                      <PrivateRoute>
                        <Payslips />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/employee/announcements"
                    element={
                      <PrivateRoute>
                        <Announcements />
                      </PrivateRoute>
                    }
                  />

                  {/* Default redirect */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </EmployeeProvider>
    </AuthProvider>
  );
}

export default App;