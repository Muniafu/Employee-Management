import Layout from "./Layout";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AdminLayout({ children }) {
  const { user } = useAuth();

  if (!user || user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container-fluid min-vh-100 bg-light">
        {/* Admin Header */}
        <header
          className="bg-primary text-white py-3 px-4 shadow-sm mb-4"
          role="banner"
        >
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h4 fw-bold m-0">
              Admin Dashboard
            </h1>
            <span className="small">
              Welcome, <strong>{user?.firstName || "Admin"}</strong>
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container py-3" role="main">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            {children}
          </div>
        </main>
      </div>
    </Layout>
  );
}