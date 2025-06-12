import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getUsers, approveUser, rejectUser } from '../services/api';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers(token);
      setUsers(res);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await approveUser(id, token);
      } else {
        await rejectUser(id, token);
      }
      
      // Optimistic UI update
      setUsers(users.map(u => 
        u._id === id ? { ...u, status: action === 'approve' ? 'approved' : 'rejected' } : u
      ));
      
      // Refresh data after 1 second to ensure consistency
      setTimeout(fetchUsers, 1000);
    } catch (err) {
      setError(`Failed to ${action} user`);
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Panel</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="pending-approvals">
        <h3>Pending Approvals</h3>
        {users.filter(u => u.status === 'pending').length === 0 ? (
          <p>No pending approvals</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.status === 'pending').map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                  <td className="actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleAction(user._id, 'approve')}
                    >
                      Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleAction(user._id, 'reject')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="all-users">
        <h3>All Users</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td className={`status ${user.status}`}>
                  {user.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;