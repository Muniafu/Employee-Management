import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex flex-col">

      {/* Centered Main Content */}
      <main className="flex-1 flex items-center justify-center pt-20 pb-16 px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">
              Create Account
            </h1>
            
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-indigo-100 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 
                    text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white 
                    focus:border-white transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

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
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-indigo-100 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 
                    text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white 
                    transition-all cursor-pointer"
                >
                  <option value="employee" className="bg-indigo-900">Employee</option>
                  <option value="admin" className="bg-indigo-900">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold 
                  rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 
                  disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <p className="mt-8 text-center text-indigo-200">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-white hover:text-indigo-100 font-semibold underline underline-offset-4"
              >
                Login Here
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
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

export default Register;