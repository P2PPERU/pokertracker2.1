require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jugadorRoutes = require("./routes/jugadorRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 📌 Agregar rutas de autenticación
app.use("/api/auth", userRoutes);

// ✅ Ruta de bienvenida
app.get("/", (req, res) => {
  res.send("🚀 Bienvenido a la API de PokerTracker 2.0");
});

// Rutas
app.use("/api", jugadorRoutes);
app.use("/api/admin", adminRoutes);

// Puerto del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
// Compare this snippet from backend/app.js:
// const express = require("express");
// Test para activar deploy