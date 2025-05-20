🃏 PokerProTrack 2.1
Mostrar imagen
📋 Descripción general
PokerProTrack es una aplicación web profesional para el análisis avanzado de jugadores de póker con enfoque en cash games. La plataforma proporciona análisis estadístico detallado, visualizaciones interactivas y análisis impulsado por IA para ayudar a los jugadores a identificar patrones y debilidades en sus oponentes, dándoles una ventaja competitiva en las mesas.
Esta versión 2.1 incorpora análisis de inteligencia artificial mejorado, un sistema de favoritos, y una visualización de datos optimizada para una mejor experiencia de usuario.
✨ Características principales

🔍 Búsqueda inteligente de jugadores: Encuentra rápidamente jugadores por nombre con autocompletado.
📊 Estadísticas detalladas: Accede a más de 20 métricas clave como VPIP, PFR, 3-Bet, WTSD, WSD y más.
🧠 Análisis de IA: Recibe informes personalizados que identifican patrones de juego y debilidades explotables.
📈 Gráficos de evolución de ganancias: Visualiza la progresión de ganancias con estadísticas por showdown y sin showdown.
⭐ Sistema de favoritos: Guarda jugadores para un acceso rápido y seguimiento continuo.
🏆 Ranking de jugadores: Visualiza a los mejores jugadores por stake con métricas de rendimiento.
👑 Sistema de suscripciones: Tres niveles (Bronce, Plata y Oro) con diferentes características y beneficios.
🔐 Autenticación y seguridad: Sistema completo con JWT, recuperación de contraseña y verificación por email.

🔧 Tecnologías utilizadas
Frontend

React.js con Hooks
Chakra UI para interfaz de usuario
Recharts para visualizaciones gráficas
React Router para navegación
Axios para peticiones HTTP
Framer Motion para animaciones

Backend

Node.js con Express
PostgreSQL para base de datos
JSON Web Tokens (JWT) para autenticación
bcryptjs para encriptación de contraseñas
OpenAI API para análisis de IA
Nodemailer para envío de correos
Compression para optimización de respuestas HTTP

🚀 Instalación y configuración
Requisitos previos

Node.js (v16+)
PostgreSQL (v12+)
Una cuenta en OpenAI para la API

Instalación

Clonar el repositorio

bashgit clone https://github.com/tu-usuario/pokerprotrack.git
cd pokerprotrack

Instalar dependencias del Backend

bashcd backend
npm install

Instalar dependencias del Frontend

bashcd ../frontend
npm install

Configurar variables de entorno

Crea un archivo .env en la carpeta backend con las siguientes variables:
# Servidor
PORT=3000

# Base de Datos
DB_USER=tu_usuario_postgres
DB_HOST=localhost
DB_NAME=PT4DB
DB_PASSWORD=tu_password
DB_PORT=5432

# JWT
JWT_SECRET=un_secreto_muy_seguro

# OpenAI API
OPENAI_API_KEY=tu_api_key_de_openai

# Email
EMAIL_USER=no-reply@pokerprotrack.com
EMAIL_PASS=tu_password_email

Configurar la base de datos

Asegúrate de tener una base de datos PostgreSQL llamada PT4DB con las tablas necesarias.

Iniciar el servidor de desarrollo

Backend:
bashcd backend
npm run dev
Frontend:
bashcd frontend
npm run dev
📁 Estructura del proyecto
pokerprotrack/
├── backend/
│   ├── config/         # Configuración de DB y servicios
│   ├── controllers/    # Controladores de rutas
│   ├── middleware/     # Middlewares de autenticación
│   ├── models/         # Modelos de datos
│   ├── routes/         # Definición de rutas API
│   ├── utils/          # Utilidades (email, etc.)
│   ├── app.js          # Punto de entrada del servidor
│   └── package.json    # Dependencias backend
│
└── frontend/
    ├── public/         # Archivos estáticos
    │   └── images/     # Imágenes y recursos
    ├── src/
    │   ├── components/ # Componentes React reutilizables
    │   ├── context/    # Contextos React (Auth)
    │   ├── pages/      # Componentes de página
    │   ├── routes/     # Configuración de rutas
    │   ├── services/   # Servicios API
    │   ├── App.jsx     # Componente principal
    │   └── main.jsx    # Punto de entrada
    └── package.json    # Dependencias frontend
📊 Módulos principales
Sistema de usuarios y autenticación

Registro: Crea una cuenta proporcionando nombre, email, contraseña y teléfono
Login: Accede con credenciales y recibe un JWT
Recuperación de contraseña: Sistema de recuperación vía email
Verificación de email: Validación de cuentas por correo electrónico

Dashboard de jugadores

Búsqueda de jugadores: Busca jugadores por nombre con autocompletado
Visualización de estadísticas: Más de 20 métricas detalladas
Copiado de estadísticas: Selecciona y copia stats específicas para usar en tu HUD
Análisis de IA: Solicita análisis de inteligencia artificial del estilo de juego
Gráficos de ganancias: Visualiza la evolución de las ganancias en el tiempo

Sistema de favoritos

Añadir/eliminar favoritos: Marca jugadores para acceso rápido
Listado de favoritos: Visualiza todos tus jugadores guardados
Acceso a estadísticas: Accede directamente a los datos completos desde favoritos

Ranking de jugadores

Filtrado por stakes: Visualiza rankings por diferentes niveles de ciegas
Ordenación personalizable: Ordena por diferentes métricas (BB/100, ganancias)
Visualización optimizada: Interfaz adaptable para desktop y móvil

Panel de administración

Gestión de usuarios: Ver, modificar y eliminar usuarios
Control de suscripciones: Cambiar niveles de suscripción y fechas de expiración
Métricas de uso: Seguimiento de solicitudes de IA y actividad

🔐 Niveles de suscripción
🥉 Bronce (Gratuito)

Acceso limitado a estadísticas
100 búsquedas de jugador por día
Sin informes IA
Soporte básico por email

🥈 Plata ($9.99/mes)

Acceso completo a estadísticas
Búsquedas ilimitadas
100 análisis IA por mes
Acceso a gráfico de ganancias
Asistencia por WhatsApp

🥇 Oro ($19.99/mes)

Estadísticas avanzadas y desglosadas
Análisis IA ilimitado + acceso prioritario
Soporte premium personalizado
Sugerencias de acción en tiempo real
Acceso anticipado a nuevas funciones

🌐 API Endpoints
Autenticación

POST /api/auth/registro: Registra un nuevo usuario
POST /api/auth/login: Inicia sesión y obtiene token JWT
GET /api/auth/verificar: Verifica correo electrónico
POST /api/auth/recuperar-password: Solicita recuperación de contraseña
POST /api/auth/resetear-password: Establece nueva contraseña

Jugadores

GET /api/jugador/:sala/:nombre: Obtiene estadísticas de un jugador
GET /api/jugador/autocomplete/:sala/:query: Busca sugerencias de nombres
GET /api/jugador/:sala/:nombre/analisis: Solicita análisis de IA
GET /api/grafico-ganancias/:nombre: Obtiene datos para el gráfico de ganancias
GET /api/top-jugadores/:stake: Obtiene ranking de jugadores por stake

Favoritos

GET /api/favoritos: Lista todos los favoritos del usuario
GET /api/favoritos/:sala/:player_name: Verifica si un jugador es favorito
POST /api/favoritos: Añade un jugador a favoritos
DELETE /api/favoritos/:sala/:player_name: Elimina un jugador de favoritos

Admin

GET /api/admin/usuarios: Lista todos los usuarios
PUT /api/admin/usuarios/:id/suscripcion: Actualiza suscripción de usuario
PUT /api/admin/usuarios/:id/expiracion: Actualiza fecha de expiración
DELETE /api/admin/usuario/:id: Elimina usuario
PUT /api/admin/usuarios/:id/bloquear: Bloquea/desbloquea usuario

💻 Uso de la aplicación
Búsqueda de jugadores

Navega al Dashboard
Selecciona la sala de póker (XPK, PPP, SUP)
Ingresa el nombre del jugador en el campo de búsqueda
Haz clic en "Buscar" o selecciona una de las sugerencias

Análisis de IA

Busca un jugador
Haz clic en "Solicitar Análisis IA"
Recibe un análisis detallado del estilo y debilidades del jugador

Gestión de favoritos

Busca un jugador
Haz clic en el ícono de estrella para agregarlo a favoritos
Accede a la página de Favoritos para ver todos tus jugadores guardados

Visualización de rankings

Navega a la página de Top Jugadores
Selecciona el nivel de stake deseado
Ordena la tabla por diferentes métricas haciendo clic en los encabezados

🔗 Créditos y licencia
PokerProTrack es una aplicación desarrollada para el análisis de jugadores de póker y está destinada para uso personal y educativo.
Este software incorpora varias bibliotecas de código abierto, cada una con sus respectivas licencias.
📧 Contacto y soporte
Para más información, contacta a través de:

WhatsApp: +51 991351213
Email: soporte@pokerprotrack.com


© 2025 PokerProTrack. Todos los derechos reservados.
