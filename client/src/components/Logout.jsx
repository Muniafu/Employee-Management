import { Auth as useAuth } from '../contexts/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold transition-all"
    >
      Logout
    </button>
  );
};

export default LogoutButton;