import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Auth as useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';

const EmployeeLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Employee greeting */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.department} Department
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <Outlet /> {/* Rendered child routes */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;