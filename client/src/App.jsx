import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { EmployeeProvider } from "./context/EmployeeProvider";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Landing from "./pages/Landing";

// Admin Pages
import Dashboard from "./pages/Admin/Dashboard";
import ManageEmployees from "./pages/Admin/ManageEmployees";
import ManageDepartments from "./pages/Admin/ManageDepartments";
import Attendance from "./pages/Admin/Attendance";
import Payroll from "./pages/Admin/Payroll";
import Reports from "./pages/Admin/Reports";

// Employee Pages
import Profile from "./pages/Employee/Profile";
import LeaveRequest from "./pages/Employee/LeaveRequest";
import AttendanceLog from "./pages/Employee/AttendanceLog";
import Payslips from "./pages/Employee/Payslips";
import Announcements from "./pages/Employee/Announcements";

// Common Components
import AdminLayout from "./components/AdminLayout";
import EmployeeLayout from "./components/EmployeeLayout";


//import useAuth from "./hooks/useAuth";

/**
 * Protects routes that require authentication.
 */
/*const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};*/

/**
 * Root App with routing.
 */
function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/employees" element={<ManageEmployees />} />
              <Route path="/admin/departments" element={<ManageDepartments />} />
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/payroll" element={<Payroll />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>

            {/* Employee Routes */}
            <Route element={<EmployeeLayout />}>
              <Route path="/employee/profile" element={<Profile />} />
              <Route path="/employee/leave" element={<LeaveRequest />} />
              <Route path="/employee/attendance" element={<AttendanceLog />} />
              <Route path="/employee/payslips" element={<Payslips />} />
              <Route path="/employee/announcements" element={<Announcements />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </EmployeeProvider>
    </AuthProvider>
  );
}

export default App;