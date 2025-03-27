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
import AdminPanel from './pages/AdminPanel'; // ✅ IMPORTANTE

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


          {/* 🔒 Usuarios registrados con cualquier suscripción */}
          <Route element={<PrivateRoute suscripciones={["bronce", "plata", "oro"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
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
