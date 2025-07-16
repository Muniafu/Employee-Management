import { useCallback, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Context
import { AuthContext } from './Context/AuthContext';

// Components
//import MainNav from './Navigation/MainNav';
import Dashboard from './Dashboard/pages/Dashboard';
import Register from './User/pages/Register';
import Login from './User/pages/Login';
import EditEmployee from './User/pages/EditEmployee';
//import Profile from './UserProfile/pages/Profile';
//import LeavePage from './Dashboard/components/LeavePage';
//import ApproveLeave from './Dashboard/components/ApproveLeave';
import AllLeaves from './Dashboard/pages/AllLeaves';
//import NotFound from './NotFound';

import './App.css';

function App() {
  // Authentication state management
  const getLocalItem = () => {
    return JSON.parse(localStorage.getItem("authData"));
  };
  
  const initialAuth = getLocalItem() || { token: '', userId: '', isSuperUser: false };
  const [session, setSession] = useState(initialAuth);
  const [currentUser, setCurrentUser] = useState(null);
  
  const { token, userId, isSuperUser } = session;

  // Save authentication data to localStorage
  const setLocalItem = (token, userId, superuser) => {
    const authData = {
      token: token,
      userId: userId,
      isSuperUser: superuser,
    };
    localStorage.setItem("authData", JSON.stringify(authData));
    return true;
  };

  // Login function
  const login = useCallback((jwttoken, uid, superuser) => {
    setSession({
      token: jwttoken,
      userId: uid,
      isSuperUser: superuser,
    });
    setLocalItem(jwttoken, uid, superuser);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("authData");
    setSession({
      token: "",
      userId: "",
      isSuperUser: false,
    });
    setCurrentUser(null);
  }, []);

  // Fetch current user data
  const getUserData = useCallback(async () => {
    if (token && userId) {
      try {
        const response = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
  }, [token, userId]);

  // Fetch user data when token or userId changes
  useEffect(() => {
    if (token && userId) {
      getUserData();
    }
  }, [token, userId, getUserData]);

  // Provide authentication context to all components
  const authContextValue = {
    isLoggedIn: !!token,
    userId: userId,
    token: token,
    isSuperUser: isSuperUser,
    currentUser: currentUser,
    getUserData: getUserData,
    login: login,
    logout: logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <div className="app-container">
          {/*<MainNav />*/}
          
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/leave-page" element={<AllLeaves />} />
              {/*<Route path="/ask-for-leave/:uid" element={<LeavePage />} />*/}
              <Route path="/edit/:uid" element={<EditEmployee />} />
              {/*<Route path="/profile/:uid" element={<Profile />} />*/}
              {/*<Route path="/approve-leave" element={<ApproveLeave />} />*/}
              {/*<Route path="*" element={<NotFound />} />*/}
            </Routes>
          </div>
          
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;