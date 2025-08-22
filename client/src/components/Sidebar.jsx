import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <aside className="w-60 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <nav className="flex flex-col gap-3">
        {user?.role === "admin" ? (
          <>
            <Link to="/admin/dashboard" className="hover:text-blue-400">Overview</Link>
            <Link to="/admin/employees" className="hover:text-blue-400">Manage Employees</Link>
            <Link to="/admin/departments" className="hover:text-blue-400">Departments</Link>
            <Link to="/admin/attendance" className="hover:text-blue-400">Attendance</Link>
            <Link to="/admin/payroll" className="hover:text-blue-400">Payroll</Link>
            <Link to="/admin/reports" className="hover:text-blue-400">Reports</Link>
          </>
        ) : (
          <>
            <Link to="/employee/profile" className="hover:text-blue-400">Profile</Link>
            <Link to="/employee/attendance" className="hover:text-blue-400">Attendance Log</Link>
            <Link to="/employee/leave" className="hover:text-blue-400">Leave Request</Link>
            <Link to="/employee/payslips" className="hover:text-blue-400">Payslips</Link>
            <Link to="/employee/announcements" className="hover:text-blue-400">Announcements</Link>
          </>
        )}
      </nav>
    </aside>
  );
}