const db = require("../config/db");
const bcrypt = require("bcryptjs");

// 📌 Registrar usuario con suscripción inicial "bronce"
const registrarUsuario = async (nombre, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 🔒 Encriptar contraseña
        
        const query = `
            INSERT INTO usuarios (nombre, email, password, suscripcion)
            VALUES ($1, $2, $3, 'bronce') 
            RETURNING id, nombre, email, suscripcion, fecha_creacion;
        `;

        const { rows } = await db.query(query, [nombre, email, hashedPassword]);
        return rows[0];
    } catch (error) {
        console.error("❌ Error en el registro:", error);
        throw new Error("Error al registrar usuario");
    }
};

// 📌 Buscar usuario por email
const obtenerUsuarioPorEmail = async (email) => {
    try {
        const query = "SELECT * FROM usuarios WHERE email = $1";
        const { rows } = await db.query(query, [email]);
        return rows[0] || null;
    } catch (error) {
        console.error("❌ Error al buscar usuario:", error);
        throw new Error("Error al buscar usuario");
    }
};

// 📌 Actualizar suscripción de un usuario
const actualizarSuscripcion = async (idUsuario, nuevaSuscripcion) => {
    try {
        const categoriasValidas = ["bronce", "plata", "oro"];
        if (!categoriasValidas.includes(nuevaSuscripcion)) {
            throw new Error("Categoría inválida");
        }

        const query = `
            UPDATE usuarios 
            SET suscripcion = $1 
            WHERE id = $2 
            RETURNING id, nombre, email, suscripcion;
        `;

        const { rows } = await db.query(query, [nuevaSuscripcion, idUsuario]);

        if (rows.length === 0) {
            throw new Error("Usuario no encontrado");
        }

        return rows[0];
    } catch (error) {
        console.error("❌ Error al actualizar la suscripción:", error);
        throw new Error("Error al actualizar la suscripción");
    }
};

module.exports = { registrarUsuario, obtenerUsuarioPorEmail, actualizarSuscripcion };
