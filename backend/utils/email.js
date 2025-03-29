const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",     // 🔄 CAMBIA esto (antes decía "gmail")
  port: 465,                 // Puerto SMTP de Zoho
  secure: true,              // Conexión SSL
  auth: {
    user: process.env.EMAIL_USER, // no-reply@pokerprotrack.com
    pass: process.env.EMAIL_PASS  // contraseña de aplicación de Zoho
  }
});

const enviarCorreoVerificacion = async (email, token) => {
  const url = `https://pokerprotrack.com/verificar?token=${token}`;
  await transporter.sendMail({
    from: `"PokerProTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifica tu correo",
    html: `<h3>Gracias por registrarte</h3><p>Haz clic para verificar tu correo: <a href="${url}">${url}</a></p>`
  });
};

const enviarCorreoRecuperacion = async (email, token) => {
  const link = `https://pokerprotrack.com/resetear?token=${token}`;
  await transporter.sendMail({
    from: `"PokerProTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Recupera tu contraseña",
    html: `
      <h3>Recuperación de Contraseña</h3>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${link}">${link}</a>
      <p>Este enlace expira en 15 minutos.</p>
    `
  });
};

module.exports = { enviarCorreoVerificacion, enviarCorreoRecuperacion };
