import Layout from "./Layout";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function EmployeeLayout({ children }) {
  const { user } = useAuth();

  if (!user || user.role?.toLowerCase() !== "employee") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container-fluid min-vh-100 bg-light">
        {/* Employee Header */}
        <header
          className="bg-success text-white py-3 px-4 shadow-sm mb-4"
          role="banner"
        >
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h5 fw-bold m-0">
              Employee Portal
            </h1>
            <span className="small">
              Hello, <strong>{user?.firstName || "Employee"}</strong>
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-3" role="main">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            {children}
          </div>
        </main>
      </div>
    </Layout>
  );
}