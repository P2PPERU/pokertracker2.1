import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Navbar from './components/Navbar';
import Suscripciones from './pages/Suscripciones';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TopJugadores from "./pages/TopJugadores";
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import RecuperarPassword from './pages/RecuperarPassword';
import ResetearPassword from './pages/ResetearPassword';
import Perfil from './pages/Perfil'; // ⬆️ NUEVO

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/top-jugadores" element={<TopJugadores />} />
          <Route path="/suscripciones" element={<Suscripciones />} />
          <Route path="/recuperar" element={<RecuperarPassword />} />
          <Route path="/resetear" element={<ResetearPassword />} />

          {/* 🔒 Usuarios registrados con cualquier suscripción */}
          <Route element={<PrivateRoute suscripciones={["bronce", "plata", "oro"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} /> {/* ⬆️ NUEVO */}
          </Route>

          {/* 🔒 Solo accesible para rol "admin" */}
          <Route element={<PrivateRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
