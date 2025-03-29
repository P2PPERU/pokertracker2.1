const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registrarUsuario, obtenerUsuarioPorEmail,actualizarSuscripcion } = require("../models/userModel");
const { enviarCorreoVerificacion } = require("../utils/email");
const { verificarEmail } = require("../models/userModel");
const { enviarCorreoRecuperacion } = require("../utils/email");


// 📌 Registro de usuario
const registro = async (req, res) => {
    const { nombre, email, password, telefono } = req.body;

    try {
        const usuarioExistente = await obtenerUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ error: "El email ya está registrado." });
        }

        const nuevoUsuario = await registrarUsuario(nombre, email, password, telefono);

        const token = jwt.sign(
            { id: nuevoUsuario.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        await enviarCorreoVerificacion(email, token);

        res.json({ mensaje: "Usuario registrado. Verifica tu correo para activar la cuenta." });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
};

const resetearPassword = async (req, res) => {
    const { token, nuevaPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nuevaPassword, salt);

        await pool.query("UPDATE usuarios SET password = $1 WHERE id = $2", [hashedPassword, decoded.id]);

        res.json({ mensaje: "✅ Contraseña actualizada con éxito. Ya puedes iniciar sesión." });
    } catch (error) {
        console.error("Error en resetearPassword:", error);
        res.status(400).json({ error: "❌ Enlace inválido o expirado." });
    }
};


const verificarCuenta = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await verificarEmail(decoded.id);
        res.send("✅ ¡Correo verificado! Ya puedes iniciar sesión.");
    } catch (err) {
        res.status(400).send("❌ Enlace inválido o expirado.");
    }
};

// 📌 Login de usuario
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await obtenerUsuarioPorEmail(email);
        if (!usuario) {
            return res.status(400).json({ error: "Email o contraseña incorrectos" });
        }

        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(400).json({ error: "Email o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // 🔒 Expira en 7 días
        );

        res.json({ mensaje: "Login exitoso", token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};

// 📌 Actualizar suscripción del usuario
const actualizarSuscripcionController = async (req, res) => {
    const { idUsuario, nuevaSuscripcion } = req.body;

    try {
        const usuarioActualizado = await actualizarSuscripcion(idUsuario, nuevaSuscripcion);
        res.json({ mensaje: "Suscripción actualizada con éxito", usuario: usuarioActualizado });
    } catch (error) {
        console.error("Error al actualizar la suscripción:", error);
        res.status(500).json({ error: "Error al actualizar la suscripción" });
    }
};

const recuperarPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await obtenerUsuarioPorEmail(email);
        if (!usuario) {
            return res.status(404).json({ error: "No existe cuenta con ese correo" });
        }

        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" } // Token expira en 15 minutos
        );

        await enviarCorreoRecuperacion(email, token);

        res.json({ mensaje: "Te enviamos un correo para restablecer tu contraseña." });
    } catch (error) {
        console.error("Error en recuperarPassword:", error);
        res.status(500).json({ error: "Error al enviar enlace de recuperación" });
    }
};

// Exportar controladores
module.exports = { registro, login, actualizarSuscripcion: actualizarSuscripcionController, verificarCuenta, recuperarPassword, resetearPassword };
