import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ suscripciones }) => {
  const { auth } = useAuth()

  if (!auth) return <Navigate to="/" />

  if (suscripciones && !suscripciones.includes(auth.suscripcion)) {
    return <Navigate to="/" />
  }

  return <Outlet />
}

export default PrivateRoute
