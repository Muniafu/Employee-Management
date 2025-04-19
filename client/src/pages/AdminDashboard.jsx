import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Auth as useAuth } from '../contexts/AuthContext';
import { AdminService } from '../services/adminService';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [page] = useState(5);
  useAuth();
  
  const fetchEmployees = async () => {
    try {
        setLoading(true);
        const response = await AdminService.getAllEmployees();
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * page,
    currentPage * page
    );

    const totalPages = Math.ceil(employees.length / page);

  if (loading) return <div className="text-center py-8"><Loader /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Employee Performance</h2>
          <Link
            to="/performance/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Review
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Department</th>
                <th className="py-2 px-4 text-left">Last Review</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee) => (
                <tr key={employee._id} className="border-b">
                  <td className="py-2 px-4">{employee.name}</td>
                  <td className="py-2 px-4">{employee.email}</td>
                  <td className="py-2 px-4">{employee.department}</td>
                  <td className="py-2 px-4">
                    {employee.lastReviewed ? new Date(employee.lastReviewed).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-2 px-4">
                    <Link
                      to={`/performance/${employee._id}`}
                      className="text-blue-500 hover:underline mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          await AdminService.deleteEmployee(employee._id);
                          toast.success('Employee deleted successfully!');
                          fetchEmployees();
                        } catch {
                          toast.error('Failed to delete employee!');
                        }
                      }}
                      className="text-red-500 hover:underline"
                    >
                        Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                    {index + 1}
                </button>
                ))
            }
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;