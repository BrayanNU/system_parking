// utils/emailReserva.js
const nodemailer = require("nodemailer");

/**
 * 📨 Configura el transporte de correos (usa Gmail o SMTP del entorno)
 */
async function crearTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Modo de prueba (Ethereal)
    const testAccount = await nodemailer.createTestAccount();
    console.log("🧪 Usando cuenta de prueba Ethereal:", testAccount.user);
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}

/**
 * 📧 Enviar correo (genérico o de confirmación)
 * Si se pasa `asunto` y `mensajeHTML`, se usa como correo personalizado.
 * Si no, se genera el correo estándar de confirmación de reserva.
 */
async function enviarCorreoReserva({
  correo,
  nombre,
  apellido,
  codigo,
  espacio,
  horaEntrada,
  horaSalida,
  monto,
  fecha,
  asunto,
  mensajeHTML,
}) {
  try {
    if (!correo) {
      console.warn("⚠️ No se proporcionó correo, se omite el envío.");
      return;
    }

    const transporter = await crearTransporter();

    // Si no se pasa un asunto o mensajeHTML, usar el correo estándar
    if (!asunto || !mensajeHTML) {
      asunto = "Confirmación de Reserva - SystemParking";
      mensajeHTML = `
        <div style="font-family: Arial, sans-serif; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2e86de;">¡Reserva creada correctamente!</h2>
          <p>Estimado/a <b>${nombre || ""} ${apellido || ""}</b>,</p>
          <p>Tu reserva fue registrada exitosamente en <b>SystemParking</b>.</p>

          <h3>Detalles de la reserva:</h3>
          <ul>
            <li><b>Código:</b> ${codigo || "N/A"}</li>
            <li><b>Fecha:</b> ${fecha || "N/A"}</li>
            <li><b>Hora de entrada:</b> ${horaEntrada || "N/A"}</li>
            <li><b>Hora de salida:</b> ${horaSalida || "N/A"}</li>
            <li><b>Espacio asignado:</b> ${espacio || "N/A"}</li>
            <li><b>Monto total:</b> S/. ${monto || "0.00"}</li>
          </ul>

          <p>Por favor llega 10 minutos antes de la hora de ingreso.</p>
          <p>Gracias por confiar en nosotros.</p>

          <p style="color:#555;">Atentamente,<br><b>Equipo SystemParking</b></p>
        </div>
      `;
    }

    const mailOptions = {
      from: `"SystemParking" <${process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@systemparking.com"}>`,
      to: correo,
      subject: asunto,
      html: mensajeHTML,
    };

    const info = await transporter.sendMail(mailOptions);

    if (nodemailer.getTestMessageUrl && info && info.messageId) {
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    console.log(`✅ Correo enviado a ${correo} | Asunto: ${asunto}`);
  } catch (error) {
    console.error("❌ Error enviando correo de reserva:", error);
  }
}

module.exports = { enviarCorreoReserva };
