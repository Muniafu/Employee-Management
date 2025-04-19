import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  // Redirect non-admins (optional: or show "access denied")
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-0 md:ml-64 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Admin-specific header */}
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                {user?.role.toUpperCase()}
              </span>
            </div>
            <Outlet /> {/* Rendered child routes */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;