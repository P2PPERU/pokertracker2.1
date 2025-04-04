const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// 📌 Middleware principal que verifica el token y actualiza suscripción si expiró
const verificarToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("🔍 Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Acceso denegado, token no proporcionado o mal formateado",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decodificado del token:", verificado);
    const usuarioId = verificado.id;

    // 🔍 Consultamos desde la BD para validar expiración real
    const { rows } = await pool.query(
      "SELECT suscripcion, suscripcion_expira FROM usuarios WHERE id = $1",
      [usuarioId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuarioBD = rows[0];
    const hoy = new Date();

    // 🔄 Verificar expiración de oro/plata
    if (
      (usuarioBD.suscripcion === "oro" || usuarioBD.suscripcion === "plata") &&
      usuarioBD.suscripcion_expira &&
      new Date(usuarioBD.suscripcion_expira) < hoy
    ) {
      // ⏱️ Suscripción expirada → volver a bronce automáticamente
      await pool.query(
        "UPDATE usuarios SET suscripcion = 'bronce', suscripcion_expira = NULL WHERE id = $1",
        [usuarioId]
      );

      verificado.suscripcion = "bronce";
    } else {
      // Si sigue vigente, sincronizamos con base de datos
      verificado.suscripcion = usuarioBD.suscripcion;
    }

    req.usuario = verificado;
    next();
  } catch (error) {
    console.error("❌ Error en verificarToken:", error);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// 📌 Verifica si el usuario es ADMIN
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== "admin") {
    return res
      .status(403)
      .json({ error: "Acceso denegado, se requieren permisos de administrador" });
  }
  next();
};

// 📌 Middleware para verificar rol/suscripción del usuario
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.suscripcion) {
      return res
        .status(403)
        .json({ error: "Acceso denegado, usuario sin suscripción válida" });
    }

    if (!rolesPermitidos.includes(req.usuario.suscripcion)) {
      return res.status(403).json({
        error: "Acceso denegado, se requiere una suscripción superior",
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarAdmin,
};
