require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");

// 📊 NUEVAS IMPORTACIONES PARA MÉTRICAS
const eventRoutes = require("./routes/eventRoutes");
const metricRoutes = require("./routes/metricRoutes");
const trackingMiddleware = require("./middleware/trackingMiddleware");
const CronJobs = require("./utils/cronJobs");

// ✅ Rutas existentes
const jugadorRoutes = require("./routes/jugadorRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const manosRoutes = require("./routes/manosRoutes");

const app = express();

// ✅ Middleware global
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite a 10MB
app.use(compression());

// 📊 INICIALIZAR TABLAS DE MÉTRICAS (una sola vez al arrancar)
app.use(trackingMiddleware.initializeTables);

// ✅ Ruta de bienvenida
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Bienvenido a la API de PokerTracker 2.0",
    version: "2.1.0",
    metrics_enabled: true,
    timestamp: new Date().toISOString()
  });
});

// 📌 RUTAS DE AUTENTICACIÓN (con tracking)
app.use("/api/auth", 
  trackingMiddleware.trackLogin,      // Trackear logins
  trackingMiddleware.trackRegistration, // Trackear registros
  userRoutes
);

// 📊 NUEVAS RUTAS DE MÉTRICAS Y EVENTOS
app.use("/api/events", eventRoutes);
app.use("/api/metrics", metricRoutes);

// 📌 RUTAS EXISTENTES (con tracking donde corresponda)
app.use("/api/favoritos", 
  trackingMiddleware.trackFavoriteAction('added'),  // Para POST
  trackingMiddleware.trackFavoriteAction('removed'), // Para DELETE
  favoritesRoutes
);

app.use("/api/manos", manosRoutes);

// 🎯 Rutas de jugadores (con tracking de búsquedas)
app.use("/api", 
  trackingMiddleware.trackPlayerSearch,  // Trackear búsquedas
  trackingMiddleware.trackAIAnalysis,    // Trackear análisis IA
  jugadorRoutes
);

app.use("/api/admin", adminRoutes);

// 🚀 INICIALIZAR CRON JOBS
CronJobs.initializeAllJobs();

// 🚀 Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
  console.log(`📊 Sistema de métricas activado`);
  console.log(`⏰ Cron jobs programados`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   📈 GET /api/metrics/dashboard - Dashboard de métricas`);
  console.log(`   📊 GET /api/events/stats - Estadísticas de eventos`);
  console.log(`   🔄 POST /api/metrics/calculate - Calcular métricas manualmente`);
});

// 🛡️ Manejo de errores global
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});