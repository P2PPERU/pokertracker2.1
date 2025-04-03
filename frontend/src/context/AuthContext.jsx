import { createContext, useState, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null); // 👈 inicialización clara

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? jwtDecode(token) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setAuth(jwtDecode(data.token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth(null);
  };

  const value = { auth, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 👇 Esta exportación NO debe cambiar nunca entre renders
export const useAuth = () => {
  return useContext(AuthContext);
};
