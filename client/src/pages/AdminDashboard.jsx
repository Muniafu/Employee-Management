import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingUsers, approveUser, rejectUser } from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      const pending = await getPendingUsers();
      setUsers(pending);
    };
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    if (action === 'approve') await approveUser(id);
    else await rejectUser(id);
    setUsers(users.filter(user => user._id !== id)); // Remove after action
  };

  return (
    <div>
      <h2>Pending Approvals</h2>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.username} ({user.email}) —
            <button onClick={() => handleAction(user._id, 'approve')}>Approve</button>
            <button onClick={() => handleAction(user._id, 'reject')}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;