import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="d-none d-lg-flex flex-column bg-dark text-white p-3 shadow vh-100"
        style={{ width: "240px" }}
      >
        <h2 className="fs-5 fw-bold mb-4 border-bottom pb-2 text-primary">
          Dashboard
        </h2>
        <nav className="nav flex-column gap-2">
          {user?.role === "Admin" ? (
            <>
              <Link to="/admin/dashboard" className="nav-link text-white fw-semibold hover-link">Overview</Link>
              <Link to="/admin/employees" className="nav-link text-white fw-semibold hover-link">Manage Employees</Link>
              <Link to="/admin/departments" className="nav-link text-white fw-semibold hover-link">Departments</Link>
              <Link to="/admin/attendance" className="nav-link text-white fw-semibold hover-link">Attendance</Link>
              <Link to="/admin/payroll" className="nav-link text-white fw-semibold hover-link">Payroll</Link>
              <Link to="/admin/reports" className="nav-link text-white fw-semibold hover-link">Reports</Link>
            </>
          ) : (
            <>
              <Link to="/employee/profile" className="nav-link text-white fw-semibold hover-link">Profile</Link>
              <Link to="/employee/attendance" className="nav-link text-white fw-semibold hover-link">Attendance Log</Link>
              <Link to="/employee/leave" className="nav-link text-white fw-semibold hover-link">Leave Request</Link>
              <Link to="/employee/payslips" className="nav-link text-white fw-semibold hover-link">Payslips</Link>
              <Link to="/employee/announcements" className="nav-link text-white fw-semibold hover-link">Announcements</Link>
            </>
          )}
        </nav>
      </aside>

      {/* Mobile Offcanvas */}
      <div
        className="offcanvas offcanvas-start bg-dark text-white"
        tabIndex="-1"
        id="sidebarOffcanvas"
        aria-labelledby="sidebarLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title text-primary fw-bold" id="sidebarLabel">
            Dashboard
          </h5>
          <button
            type="button"
            className="btn btn-outline-light d-lg-none me-2"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
            aria-controls="sidebarOffcanvas"
            aria-label="Toggle sidebar"
          ></button>
        </div>
        <div className="offcanvas-body">
          <nav className="nav flex-column gap-2">
            {user?.role === "Admin" ? (
              <>
                <Link to="/admin/dashboard" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Overview</Link>
                <Link to="/admin/employees" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Manage Employees</Link>
                <Link to="/admin/departments" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Departments</Link>
                <Link to="/admin/attendance" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Attendance</Link>
                <Link to="/admin/payroll" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Payroll</Link>
                <Link to="/admin/reports" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Reports</Link>
              </>
            ) : (
              <>
                <Link to="/employee/profile" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Profile</Link>
                <Link to="/employee/attendance" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Attendance Log</Link>
                <Link to="/employee/leave" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Leave Request</Link>
                <Link to="/employee/payslips" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Payslips</Link>
                <Link to="/employee/announcements" className="nav-link text-white fw-semibold hover-link" data-bs-dismiss="offcanvas">Announcements</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}