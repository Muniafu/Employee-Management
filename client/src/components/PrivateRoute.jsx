import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { token, user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (adminOnly && user.role !== 'admin') return <Navigate to="/unauthorized" />

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;