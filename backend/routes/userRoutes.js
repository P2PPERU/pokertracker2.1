const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { verificarToken, verificarRol, verificarAdmin } = require("../middleware/authMiddleware");
const { verificarCuenta } = require("../controllers/userController");
const { recuperarPassword } = require("../controllers/userController");
const { resetearPassword } = require("../controllers/userController");

// 📊 NUEVO: Importar EventLogger para tracking manual
const { EventLogger } = require("../utils/eventLogger");

const router = express.Router();

router.post("/recuperar-password", recuperarPassword);

router.post("/resetear-password", resetearPassword);

// 📌 Ruta para que el ADMIN modifique la suscripción de cualquier usuario
router.post("/admin/cambiar-suscripcion", verificarToken, verificarAdmin, async (req, res) => {
    const { usuarioId, nuevaSuscripcion } = req.body;
    const categoriasValidas = ["bronce", "plata", "oro"];

    if (!categoriasValidas.includes(nuevaSuscripcion)) {
        return res.status(400).json({ error: "Categoría inválida" });
    }

    try {
        await pool.query("UPDATE usuarios SET suscripcion = $1 WHERE id = $2", [nuevaSuscripcion, usuarioId]);
        
        // 📊 NUEVO: Trackear cambio de suscripción
        EventLogger.subscriptionActivated(usuarioId, {
            plan: nuevaSuscripcion,
            price: nuevaSuscripcion === 'oro' ? 19.99 : nuevaSuscripcion === 'plata' ? 11.99 : 0,
            changed_by_admin: true
        }, req).catch(console.error);
        
        res.json({ mensaje: `Suscripción del usuario ${usuarioId} actualizada a ${nuevaSuscripcion}` });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la suscripción" });
    }
});

// 📌 Ruta para que el ADMIN vea todos los usuarios y sus suscripciones
router.get("/admin/usuarios", verificarToken, verificarAdmin, async (req, res) => {
    try {
        const result = await pool.query("SELECT id, nombre, email, suscripcion FROM usuarios");
        res.json({ usuarios: result.rows });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la lista de usuarios" });
    }
});

// 📌 Registro de usuario (permite definir rol y suscripción)
router.post("/registro", async (req, res) => {
    const { nombre, email, password, telefono, rol = "usuario", suscripcion = "bronce" } = req.body;
    
    try {
        // 🔒 Encriptar contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 📝 Insertar usuario en la BD con rol y suscripción opcionales
        const query = `
            INSERT INTO usuarios (nombre, email, password, telefono, suscripcion, rol) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, email, suscripcion, rol;
        `;
        const values = [nombre, email, hashedPassword, telefono, suscripcion, rol];

        const result = await pool.query(query, values);
        const newUser = result.rows[0];

        // 📊 NUEVO: Trackear registro (el middleware ya lo hace, pero por si acaso)
        EventLogger.userRegistered(newUser.id, {
            email: newUser.email,
            nombre: newUser.nombre,
            suscripcion: newUser.suscripcion,
            telefono: telefono
        }, req).catch(console.error);

        res.json({ 
            mensaje: "Usuario registrado con éxito", 
            success: true,  // Para que el middleware detecte éxito
            usuario: newUser,
            user: newUser  // Para compatibilidad con middleware
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// 📌 Verificación de correo tras registro
router.get("/verificar", verificarCuenta);

// 📌 Inicio de sesión (Asegurar que el token incluya el rol)
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Email o contraseña incorrectos" });
        }

        const usuario = result.rows[0];
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(400).json({ error: "Email o contraseña incorrectos" });
        }

        // 🔐 Incluir el rol en el token
        const token = jwt.sign(
            { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                email: usuario.email, 
                rol: usuario.rol,
                suscripcion: usuario.suscripcion 
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 📊 NUEVO: Almacenar usuario en req para tracking
        req.user = usuario;

        res.json({ 
            mensaje: "Login exitoso", 
            token, 
            usuario: { 
                id: usuario.id, 
                nombre: usuario.nombre, 
                email: usuario.email, 
                rol: usuario.rol, 
                suscripcion: usuario.suscripcion 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});

// 📌 Obtener perfil del usuario autenticado
router.get("/perfil", verificarToken, async (req, res) => {
    try {
      const usuario = await pool.query(`
        SELECT id, nombre, email, suscripcion, suscripcion_expira 
        FROM usuarios 
        WHERE id = $1
      `, [req.usuario.id]);
  
      res.json({ mensaje: "Perfil de usuario", usuario: usuario.rows[0] });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el perfil" });
    }
});

// 📌 Cambio de suscripción
router.post("/cambiar-suscripcion", verificarToken, async (req, res) => {
    const { nuevaSuscripcion } = req.body;
    const categoriasValidas = ["bronce", "plata", "oro"];

    if (!categoriasValidas.includes(nuevaSuscripcion)) {
        return res.status(400).json({ error: "Categoría inválida" });
    }

    // 🔴 No permite bajar de categoría
    if (req.usuario.suscripcion === "oro" && nuevaSuscripcion !== "oro") {
        return res.status(400).json({ error: "No puedes bajar de categoría" });
    }

    try {
        // Actualizar la suscripción en la base de datos
        await pool.query("UPDATE usuarios SET suscripcion = $1 WHERE id = $2", [nuevaSuscripcion, req.usuario.id]);

        // 📊 NUEVO: Trackear cambio de suscripción
        if (nuevaSuscripcion !== "bronce") {
            EventLogger.subscriptionActivated(req.usuario.id, {
                plan: nuevaSuscripcion,
                price: nuevaSuscripcion === 'oro' ? 19.99 : 11.99,
                upgraded_from: req.usuario.suscripcion
            }, req).catch(console.error);
        }

        // Obtener los datos actualizados del usuario
        const result = await pool.query("SELECT id, nombre, email, suscripcion FROM usuarios WHERE id = $1", [req.usuario.id]);
        const usuarioActualizado = result.rows[0];

        // 🔐 Generar un nuevo token con la suscripción actualizada
        const nuevoToken = jwt.sign(
            { id: usuarioActualizado.id, nombre: usuarioActualizado.nombre, email: usuarioActualizado.email, suscripcion: usuarioActualizado.suscripcion },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ 
            mensaje: `Suscripción actualizada a ${nuevaSuscripcion} con éxito`, 
            nuevoToken, 
            usuario: usuarioActualizado 
        });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la suscripción" });
    }
});

// 📌 Restricciones de suscripción en las métricas
router.get("/estadisticas-basicas", verificarToken, async (req, res) => {
    res.json({ mensaje: "Acceso a estadísticas básicas" });
});

router.get("/estadisticas-avanzadas", verificarToken, verificarRol(["plata", "oro"]), async (req, res) => {
    res.json({ mensaje: "Acceso a estadísticas avanzadas" });
});

router.get("/analisis-ia", verificarToken, verificarRol(["oro"]), async (req, res) => {
    res.json({ mensaje: "Acceso a análisis con IA premium" });
});

module.exports = router;