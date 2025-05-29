// backend/models/manosModel.js
const db = require("../config/db");

// Guardar archivo de manos subido por usuario
const guardarArchivoManos = async (usuarioId, nombreUsuario, emailUsuario, nombreArchivo, contenidoArchivo) => {
  try {
    const query = `
      INSERT INTO manos_subidas (usuario_id, nombre_usuario, email_usuario, nombre_archivo, contenido_archivo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, fecha_subida;
    `;
    
    const { rows } = await db.query(query, [
      usuarioId, 
      nombreUsuario, 
      emailUsuario, 
      nombreArchivo, 
      contenidoArchivo
    ]);
    
    return rows[0];
  } catch (error) {
    console.error("Error guardando archivo de manos:", error);
    throw new Error("Error al guardar el archivo de manos");
  }
};

// Obtener todos los archivos pendientes (para admin)
const obtenerManosPendientes = async () => {
  try {
    const query = `
      SELECT 
        id, 
        usuario_id,
        nombre_usuario,
        email_usuario,
        nombre_archivo,
        estado,
        fecha_subida,
        fecha_analisis
      FROM manos_subidas 
      ORDER BY fecha_subida DESC;
    `;
    
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error obteniendo manos pendientes:", error);
    throw error;
  }
};

// Obtener contenido de archivo específico (para admin)
const obtenerContenidoArchivo = async (id) => {
  try {
    const query = `
      SELECT contenido_archivo, nombre_archivo 
      FROM manos_subidas 
      WHERE id = $1;
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0];
  } catch (error) {
    console.error("Error obteniendo contenido de archivo:", error);
    throw error;
  }
};

// Guardar análisis del admin
const guardarAnalisisAdmin = async (id, analisis) => {
  try {
    const query = `
      UPDATE manos_subidas 
      SET analisis_admin = $1, estado = 'analizado', fecha_analisis = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    
    const { rows } = await db.query(query, [analisis, id]);
    return rows[0];
  } catch (error) {
    console.error("Error guardando análisis admin:", error);
    throw error;
  }
};

// Obtener archivos del usuario con sus análisis
const obtenerManosUsuario = async (usuarioId) => {
  try {
    const query = `
      SELECT 
        id,
        nombre_archivo,
        estado,
        analisis_admin,
        fecha_subida,
        fecha_analisis
      FROM manos_subidas 
      WHERE usuario_id = $1
      ORDER BY fecha_subida DESC;
    `;
    
    const { rows } = await db.query(query, [usuarioId]);
    return rows;
  } catch (error) {
    console.error("Error obteniendo manos del usuario:", error);
    throw error;
  }
};

module.exports = {
  guardarArchivoManos,
  obtenerManosPendientes,
  obtenerContenidoArchivo,
  guardarAnalisisAdmin,
  obtenerManosUsuario
};