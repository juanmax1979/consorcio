/**
 * Servicio de envío de correos.
 * Usa la configuración de src/config/email.js (variables de entorno).
 * Si el correo no está configurado, los envíos se omiten (solo log en consola).
 */

const emailConfig = require('../config/email');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!emailConfig.isConfigured()) return null;
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
    return transporter;
  } catch (err) {
    console.warn('[email] nodemailer no disponible:', err.message);
    return null;
  }
}

/**
 * Envía un correo.
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto
 * @param {string} text - Cuerpo en texto plano
 * @param {string} [html] - Cuerpo en HTML (opcional)
 * @returns {Promise<boolean>} true si se envió, false si no está configurado o falló
 */
async function sendMail(to, subject, text, html) {
  const trans = getTransporter();
  if (!trans) {
    console.log('[email] Correo no enviado (SMTP no configurado):', { to, subject });
    return false;
  }
  try {
    await trans.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
      to,
      subject,
      text: text || '',
      html: html || undefined,
    });
    return true;
  } catch (err) {
    console.error('[email] Error al enviar:', err.message);
    return false;
  }
}

/**
 * Envía notificación por correo (ej. al crear una notificación para el usuario).
 */
async function sendNotificationEmail(to, titulo, mensaje) {
  const text = `${titulo}\n\n${mensaje || ''}`;
  const html = `<p><strong>${titulo}</strong></p>${mensaje ? `<p>${mensaje.replace(/\n/g, '<br>')}</p>` : ''}`;
  return sendMail(to, titulo, text, html);
}

/**
 * Envía mensaje de la administración por correo.
 */
async function sendMessageEmail(to, titulo, cuerpo) {
  const text = `${titulo}\n\n${cuerpo}`;
  const html = `<p><strong>${titulo}</strong></p><p>${cuerpo.replace(/\n/g, '<br>')}</p>`;
  return sendMail(to, `Mensaje: ${titulo}`, text, html);
}

module.exports = {
  sendMail,
  sendNotificationEmail,
  sendMessageEmail,
  isConfigured: () => emailConfig.isConfigured(),
};
