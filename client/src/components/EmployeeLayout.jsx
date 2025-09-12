import Layout from "./Layout";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function EmployeeLayout({ children }) {
  const { user } = useAuth();
  if (!user || user.role?.toLowerCase() !== "employee") {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}