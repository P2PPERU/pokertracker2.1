import { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { jwtDecode } from 'jwt-decode'  // Importación corregida ✅

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setAuth(jwtDecode(token))
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setAuth(jwtDecode(data.token))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
