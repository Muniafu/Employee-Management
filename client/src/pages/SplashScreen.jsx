import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FaGithub, FaLinkedin, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const SplashScreen = () => {
  const navigate = useNavigate();

  const handleCardInteraction = (path, e) => {
    if (e.type === 'click' || e.key === 'Enter') {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex flex-col content-center">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4 mt-16 mb-16">
        <div className="max-w-6xl w-full mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white animate-fade-in">
              PerformaTrack
            </h1>
            <p className="text-lg md:text-xl text-indigo-200 content-center">
              Employee Performance Management System
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Login Card */}
            <div
              role="button"
              tabIndex="0"
              onClick={(e) => handleCardInteraction('/login', e)}
              onKeyDown={(e) => handleCardInteraction('/login', e)}
              className="group bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20
              hover:border-white/40 hover:shadow-xl transition-all duration-300 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-900"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110">
                  <FaSignInAlt className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">Existing User</h2>
                <p className="text-indigo-200 text-center mb-4">
                  Access your performance dashboard
                </p>
                <button className="px-8 py-2 bg-white text-indigo-700 rounded-full font-medium
                  hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
                  Login
                </button>
              </div>
            </div>

            {/* Register Card */}
            <div
              role="button"
              tabIndex="0"
              onClick={(e) => handleCardInteraction('/register', e)}
              onKeyDown={(e) => handleCardInteraction('/register', e)}
              className="group bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20
              hover:border-white/40 hover:shadow-xl transition-all duration-300 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-900"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110">
                  <FaUserPlus className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">New User</h2>
                <p className="text-indigo-200 text-center mb-4">
                  Create your account to get started
                </p>
                <button className="px-8 py-2 bg-indigo-600 text-white rounded-full font-medium
                  hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105">
                  Register
                </button>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-12 text-center">
            <p className="text-indigo-300 mb-6">Connect with us</p>
            <div className="flex justify-center space-x-8">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-white transition-colors duration-300"
              >
                <FaGithub className="w-8 h-8" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-white transition-colors duration-300"
              >
                <FaLinkedin className="w-8 h-8" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer with Glassmorphism */}
      <footer className="fixed bottom-0 w-full bg-gray-800/80 backdrop-blur-sm py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-indigo-300">
              © {new Date().getFullYear()} PerformaTrack. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#terms" className="text-indigo-300 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#privacy" className="text-indigo-300 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
};

export default SplashScreen;