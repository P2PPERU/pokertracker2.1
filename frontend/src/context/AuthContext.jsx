import { createContext, useState, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const authData = localStorage.getItem('auth');
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.warn("No se pudo acceder a localStorage:", error);
      return null;
    }
  });
  
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const decoded = jwtDecode(data.token);
      
      const fullAuth = { ...decoded, token: data.token };
      localStorage.setItem('auth', JSON.stringify(fullAuth));
      setAuth(fullAuth);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };
  
  const logout = () => {
    try {
      localStorage.removeItem('auth');
    } catch (error) {
      console.warn("No se pudo eliminar auth del storage:", error);
    }
    setAuth(null);
  };

  const contextValue = { auth, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Exportación fuera del componente, de forma constante y sin lógica condicional
export const useAuth = () => useContext(AuthContext);
