/**
 * Configuración para el envío de correos electrónicos.
 * Todas las variables se leen de process.env (archivo .env).
 *
 * En tu archivo .env (en la raíz de backend/) agrega:
 *
 *   # Correo (SMTP)
 *   SMTP_HOST=smtp.ejemplo.com
 *   SMTP_PORT=587
 *   SMTP_SECURE=false
 *   SMTP_USER=tu_usuario
 *   SMTP_PASSWORD=tu_contraseña
 *   MAIL_FROM=consorcio@tudominio.com
 *   MAIL_FROM_NAME=Consorcio
 *
 * Para Gmail: usar SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_SECURE=false
 * y una "Contraseña de aplicación" en la cuenta de Google.
 * Para otros proveedores (SendGrid, Mailgun, etc.) consultar su documentación SMTP.
 */

module.exports = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  from: process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@consorcio.local',
  fromName: process.env.MAIL_FROM_NAME || 'Consorcio',

  /** True si hay configuración mínima para enviar correos */
  isConfigured() {
    return !!(this.host && this.user && this.password);
  },
};
