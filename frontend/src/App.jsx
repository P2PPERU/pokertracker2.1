import { useEffect, useState } from 'react';
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
import Perfil from './pages/Perfil';

import AuthModal from './components/AuthModal';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const cerrarModalLogin = () => setIsLoginModalOpen(false);

  useEffect(() => {
    const handleAbrir = () => setIsLoginModalOpen(true);
    window.addEventListener("abrir-modal-login", handleAbrir);

    return () => window.removeEventListener("abrir-modal-login", handleAbrir);
  }, []);

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
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          {/* 🔒 Solo accesible para rol "admin" */}
          <Route element={<PrivateRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>

        {/* ✅ Modal flotante controlado por evento global */}
        <AuthModal isOpen={isLoginModalOpen} onClose={cerrarModalLogin} />
      </Router>
    </AuthProvider>
  );
}

export default App;
