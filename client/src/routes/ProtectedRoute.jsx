// routes/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types';
import useAuth from '../Context/useAuth';

/**
 * ProtectedRoute component that checks authentication and authorization
 * @param {object} props - Component props
 * @param {ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.requiredRole] - Required role to access the route
 * @param {boolean} [props.redirectUnauthorized] - Whether to redirect or show unauthorized UI
 * @param {ReactNode} [props.unauthorizedComponent] - Custom UI to show when unauthorized
 * @returns {ReactNode} - Either children, redirect, or unauthorized UI
 */
export const ProtectedRoute = ({
  children,
  requiredRole
}) => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if requiredRole is specified
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};