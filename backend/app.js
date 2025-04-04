require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression"); // ✅ Nuevo

const jugadorRoutes = require("./routes/jugadorRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes"); // <-- Importar favoritesRoutes

const app = express();

// ✅ Middleware global
app.use(cors());
app.use(express.json());
app.use(compression()); // ✅ Comprime todas las respuestas HTTP

// 📌 Rutas de autenticación
app.use("/api/auth", userRoutes);

// ✅ Ruta de bienvenida
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a la API de PokerTracker 2.0");
});

// 📌 Otras rutas
app.use("/api/favoritos", favoritesRoutes)
app.use("/api", jugadorRoutes);
app.use("/api/admin", adminRoutes); // <-- Montar la ruta de favoritos

// 🚀 Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
