import { Link } from 'react-router-dom';
import { Auth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = Auth();

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Performance System
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden sm:inline">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-indigo-800 rounded hover:bg-indigo-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 bg-indigo-800 rounded hover:bg-indigo-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;