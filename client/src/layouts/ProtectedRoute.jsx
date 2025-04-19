import { Navigate, useLocation } from 'react-router-dom';
import { Auth as useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
    }

  if (roles.length > 0 && !roles.includes) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires specific roles
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;