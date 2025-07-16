import { createContext } from 'react';

const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  isSuperUser: false,
  currentUser: null,
  getUserData: () => {},
  login: () => {},
  logout: () => {},
});

export { AuthContext };
export default AuthContext;