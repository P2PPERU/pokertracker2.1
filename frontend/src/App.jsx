import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Spinner from './components/Spinner'; // Si lo sigues usando en otros lugares
import CustomLoader from './components/CustomLoader'; // <-- Importa tu loader personalizado

// 🔁 Lazy load de páginas pesadas
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TopJugadores = lazy(() => import('./pages/TopJugadores'));
const Suscripciones = lazy(() => import('./pages/Suscripciones'));
const RecuperarPassword = lazy(() => import('./pages/RecuperarPassword'));
const ResetearPassword = lazy(() => import('./pages/ResetearPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Perfil = lazy(() => import('./pages/Perfil'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
// Importa la página de Favoritos
const Favoritos = lazy(() => import('./pages/Favoritos'));
// Importa la página de Análisis de Manos
const AnalisisManos = lazy(() => import('./pages/AnalisisManos'));

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
        {/* Usa CustomLoader como fallback */}
        <Suspense fallback={<CustomLoader />}>
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
              {/* Se agrega la ruta para Favoritos */}
              <Route path="/favoritos" element={<Favoritos />} />
            </Route>

            {/* 🔒 Solo usuarios VIP (plata y oro) para análisis de manos */}
            <Route element={<PrivateRoute suscripciones={["plata", "oro"]} />}>
              <Route path="/analisis-manos" element={<AnalisisManos />} />
            </Route>

            {/* 🔒 Solo accesible para rol "admin" */}
            <Route element={<PrivateRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Routes>
        </Suspense>

        {/* ✅ Modal flotante para login */}
        <AuthModal isOpen={isLoginModalOpen} onClose={cerrarModalLogin} />
      </Router>
    </AuthProvider>
  );
}

export default App;