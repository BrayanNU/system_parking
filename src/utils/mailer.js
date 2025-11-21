const nodemailer = require("nodemailer");

// 🧩 Configuración del transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Enviar correo de reserva (inicio, proximo, casiTermina)
 */
const enviarCorreoReserva = async (data) => {
  const { correo, nombre, apellido, codigo, espacio, horaEntrada, horaSalida, monto, fecha, tipo } = data;

  if (!correo) {
    console.warn("⚠️ No se proporcionó correo, se omite el envío.");
    return;
  }

  // 📧 Personalizar mensaje
  let asunto = "";
  let mensaje = "";

  switch (tipo) {
    case "inicio":
      asunto = "✅ Tu reserva ha comenzado";
      mensaje = `
        <h2>Hola ${nombre} ${apellido} 👋</h2>
        <p>Tu reserva <b>${codigo}</b> en el espacio <b>${espacio}</b> ha comenzado.</p>
        <p><b>Hora de entrada:</b> ${horaEntrada}</p>
        <p><b>Hora de salida:</b> ${horaSalida}</p>
        <p>Gracias por confiar en <b>SystemParking</b>.</p>
      `;
      break;

    case "proximo":
      asunto = "🚗 Tu reserva está por comenzar";
      mensaje = `
        <h2>Hola ${nombre} ${apellido} 👋</h2>
        <p>Tu reserva <b>${codigo}</b> en el espacio <b>${espacio}</b> comenzará pronto.</p>
        <p><b>Hora de inicio:</b> ${horaEntrada}</p>
        <p><b>Hora de salida:</b> ${horaSalida}</p>
        <p>Te esperamos pronto 🚙</p>
      `;
      break;

    case "casiTermina":
      asunto = "⚠️ Tu reserva está por finalizar";
      mensaje = `
        <h2>Hola ${nombre} ${apellido} 👋</h2>
        <p>Tu reserva <b>${codigo}</b> en el espacio <b>${espacio}</b> finalizará en breve.</p>
        <p><b>Hora de salida:</b> ${horaSalida}</p>
        <p>Si necesitas más tiempo, puedes extenderla desde la app.</p>
      `;
      break;

    default:
      asunto = "Información sobre tu reserva";
      mensaje = "<p>Detalles de tu reserva.</p>";
  }

  // ✉️ Armar estructura HTML del correo
  const html = `
    <div style="font-family: Arial; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px;">
        ${mensaje}
        <hr style="margin-top: 20px;">
        <p style="font-size: 12px; color: gray; text-align: center;">
          Este correo fue generado automáticamente por <b>SystemParking</b>.<br>
          No respondas a este mensaje.
        </p>
      </div>
    </div>
  `;

  // 📬 Configurar remitente correctamente
  const mailOptions = {
    from: `"${process.env.FROM_NAME || "SystemParking"}" <${process.env.SMTP_USER}>`, // ✅ FIX
    to: correo,
    subject: asunto,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Correo enviado a ${correo} | Asunto: ${asunto}`);
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info) || "no disponible"}`);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error.message);
  }
};

module.exports = enviarCorreoReserva;
