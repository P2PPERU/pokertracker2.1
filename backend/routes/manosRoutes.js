// backend/routes/manosRoutes.js
const express = require("express");
const router = express.Router();
const {
  subirArchivo,
  obtenerMisArchivos,
  obtenerTodosLosPendientes,
  descargarArchivo,
  enviarAnalisis
} = require("../controllers/manosController");
const { verificarToken, verificarAdmin, verificarRol } = require("../middleware/authMiddleware");

// === RUTAS PARA USUARIOS VIP ===

// Subir archivo de manos (solo usuarios plata y oro)
router.post("/subir", verificarToken, verificarRol(["plata", "oro"]), subirArchivo);

// Obtener mis archivos subidos y sus análisis
router.get("/mis-archivos", verificarToken, verificarRol(["plata", "oro"]), obtenerMisArchivos);

// === RUTAS PARA ADMIN ===

// Obtener todos los archivos pendientes de análisis
router.get("/admin/pendientes", verificarToken, verificarAdmin, obtenerTodosLosPendientes);

// Descargar contenido de archivo específico
router.get("/admin/descargar/:id", verificarToken, verificarAdmin, descargarArchivo);

// Enviar análisis para un archivo
router.post("/admin/analisis/:id", verificarToken, verificarAdmin, enviarAnalisis);

module.exports = router;