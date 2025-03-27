const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registrarUsuario, obtenerUsuarioPorEmail,actualizarSuscripcion } = require("../models/userModel");

// 📌 Registro de usuario
const registro = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const usuarioExistente = await obtenerUsuarioPorEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ error: "El email ya está registrado." });
        }

        const nuevoUsuario = await registrarUsuario(nombre, email, password);
        res.json({ mensaje: "Usuario registrado con éxito", usuario: nuevoUsuario });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Error al registrar usuario" });
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

// Exportar controladores
module.exports = { registro, login, actualizarSuscripcion: actualizarSuscripcionController };
