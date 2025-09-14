// server/jobs/reservasJob.js
const cron = require("node-cron");
const db = require("../config/db");
const moment = require("moment");

// Tarea: revisar reservas cada minuto
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Ejecutando job de reservas...");

    const [reservas] = await db.query("SELECT * FROM reserva WHERE estado = 'activa'");
    const ahora = moment();

    for (const reserva of reservas) {
      const horaSalida = moment(`${reserva.fecha} ${reserva.horaSalida}`, "YYYY-MM-DD HH:mm:ss");

      // 1️⃣ Faltan <= 10 minutos y aún no tiene notificación de alerta
      const diffMin = horaSalida.diff(ahora, "minutes");
      if (diffMin <= 10 && diffMin > 0) {
        await db.query(
          "INSERT INTO notificaciones (idReserva, mensaje, tipo) VALUES (?, ?, 'alerta')",
          [reserva.idReserva, `⚠️ La reserva ${reserva.codigoReserva} vence en ${diffMin} minutos`]
        );
        console.log(`📢 Notificación de alerta creada para reserva ${reserva.codigoReserva}`);
      }

      // 2️⃣ Si ya venció → actualizar estado y registrar notificación + pago pendiente
      if (ahora.isAfter(horaSalida)) {
        await db.query("UPDATE reserva SET estado='finalizada' WHERE idReserva=?", [reserva.idReserva]);

        await db.query(
          "INSERT INTO notificaciones (idReserva, mensaje, tipo) VALUES (?, ?, 'reserva')",
          [reserva.idReserva, `✅ La reserva ${reserva.codigoReserva} ha finalizado`]
        );

        // 3️⃣ Registrar en pagos con estado pendiente
        await db.query(
          "INSERT INTO pagos (idReserva, monto, metodo, estado) VALUES (?, ?, ?, ?)",
          [reserva.idReserva, reserva.precioTotal, "efectivo", "pendiente"] // 👈 por defecto efectivo, admin/cliente puede cambiar después
        );

        console.log(`💰 Pago pendiente creado para reserva ${reserva.codigoReserva}`);
      }
    }
  } catch (error) {
    console.error("🔥 Error en job de reservas:", error);
  }
});
