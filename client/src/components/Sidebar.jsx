import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen fixed hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Menu</h2>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => 
                `block px-4 py-2 rounded ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          {user?.role === 'manager' && (
            <>
              <li>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) => 
                    `block px-4 py-2 rounded ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`
                  }
                >
                  Analytics
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/employees"
                  className={({ isActive }) => 
                    `block px-4 py-2 rounded ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`
                  }
                >
                  Manage Team
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;