import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Auth as useAuth } from '../contexts/AuthContext';
import AuthService from '../services/authService';
import Loader from '../components/Loader';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');      
      
      const { token, user } = await AuthService.login(formData.email, formData.password);
      login(token, user.role);
      
        if (user.role === 'admin') {
          navigate("/admin/dashboard");
        } else if (user.role === 'employee') {
          navigate("/employee/dashboard");
        } else {
          navigate("/");
        }
      } catch (err) {
        setError(err.message || 'Failed to login');
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex flex-col">
      <main className="flex-1 flex items-center justify-center pt-20 pb-16 px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">
              Employee Login
            </h1>
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-100 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 
                    text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white 
                    focus:border-white transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-indigo-100 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 
                    text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white 
                    focus:border-white transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold 
                  rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 
                  disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? <><Loader size="small" /> Authenticating...</> : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-indigo-200">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-white hover:text-indigo-100 font-semibold underline underline-offset-4"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800/80 backdrop-blur-sm py-4 fixed bottom-0 w-full">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-indigo-300">
            © {new Date().getFullYear()} PerformaTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;