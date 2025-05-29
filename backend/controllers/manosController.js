// backend/controllers/manosController.js
const {
  guardarArchivoManos,
  obtenerManosPendientes,
  obtenerContenidoArchivo,
  guardarAnalisisAdmin,
  obtenerManosUsuario
} = require("../models/manosModel");

// Subir archivo de manos (solo usuarios VIP)
const subirArchivo = async (req, res) => {
  try {
    const { nombreArchivo, contenidoArchivo } = req.body;
    const usuarioId = req.usuario.id;
    const nombreUsuario = req.usuario.nombre;
    const emailUsuario = req.usuario.email;
    
    // Validar que el usuario tenga suscripción VIP
    if (!["plata", "oro"].includes(req.usuario.suscripcion)) {
      return res.status(403).json({
        error: "Esta función solo está disponible para usuarios VIP (Plata y Oro)"
      });
    }
    
    // Validar datos
    if (!nombreArchivo || !contenidoArchivo) {
      return res.status(400).json({
        error: "Nombre de archivo y contenido son obligatorios"
      });
    }
    
    // Validar tamaño del archivo (máximo 5MB en texto)
    if (contenidoArchivo.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: "El archivo es demasiado grande. Máximo 5MB"
      });
    }
    
    const resultado = await guardarArchivoManos(
      usuarioId,
      nombreUsuario,
      emailUsuario,
      nombreArchivo,
      contenidoArchivo
    );
    
    res.status(201).json({
      mensaje: "Archivo subido exitosamente. Te notificaremos cuando esté listo el análisis.",
      id: resultado.id,
      fechaSubida: resultado.fecha_subida
    });
    
  } catch (error) {
    console.error("Error en subir archivo:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

// Obtener archivos del usuario autenticado
const obtenerMisArchivos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const archivos = await obtenerManosUsuario(usuarioId);
    
    res.json(archivos);
  } catch (error) {
    console.error("Error obteniendo archivos del usuario:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

// === FUNCIONES PARA ADMIN ===

// Obtener todos los archivos pendientes
const obtenerTodosLosPendientes = async (req, res) => {
  try {
    const archivos = await obtenerManosPendientes();
    res.json(archivos);
  } catch (error) {
    console.error("Error obteniendo archivos pendientes:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

// Descargar contenido de archivo específico
const descargarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = await obtenerContenidoArchivo(id);
    
    if (!archivo) {
      return res.status(404).json({
        error: "Archivo no encontrado"
      });
    }
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre_archivo}"`);
    
    res.send(archivo.contenido_archivo);
  } catch (error) {
    console.error("Error descargando archivo:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

// Guardar análisis para un archivo
const enviarAnalisis = async (req, res) => {
  try {
    const { id } = req.params;
    const { analisis } = req.body;
    
    if (!analisis || analisis.trim().length === 0) {
      return res.status(400).json({
        error: "El análisis no puede estar vacío"
      });
    }
    
    const resultado = await guardarAnalisisAdmin(id, analisis.trim());
    
    res.json({
      mensaje: "Análisis guardado exitosamente",
      archivo: resultado
    });
  } catch (error) {
    console.error("Error guardando análisis:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
};

module.exports = {
  subirArchivo,
  obtenerMisArchivos,
  obtenerTodosLosPendientes,
  descargarArchivo,
  enviarAnalisis
};