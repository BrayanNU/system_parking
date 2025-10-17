// server/jobs/reservasJobs.js
const cron = require("node-cron");
const moment = require("moment");
const Reserva = require("../models/reservasModel");
const Espacios = require("../models/espaciosModel");

console.log("🚀 Servicio de control automático de reservas iniciado...");

// 🕒 Ejecuta cada minuto
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Ejecutando revisión automática de reservas...");

    // 1️⃣ Obtener todas las reservas activas o próximas
    const reservas = await Reserva.getAllActivas();
    if (!reservas.length) {
      console.log("📭 No hay reservas activas o próximas en este momento.");
      return;
    }

    const ahora = moment();

    for (const r of reservas) {
      // Convertir fecha (dd/mm/yyyy → yyyy-mm-dd)
      const fechaISO = r.fecha.split("/").reverse().join("-");
      const horaEntrada = moment(`${fechaISO} ${r.horaEntrada}`, "YYYY-MM-DD HH:mm:ss");
      const horaSalida = moment(`${fechaISO} ${r.horaSalida}`, "YYYY-MM-DD HH:mm:ss");

      // Calcular diferencia en minutos con la hora actual
      const diffEntrada = horaEntrada.diff(ahora, "minutes");
      const diffSalida = horaSalida.diff(ahora, "minutes");

      // 2️⃣ Si falta menos de 10 min para la hora de entrada → marcar como “próximo”
      if (diffEntrada <= 10 && diffEntrada > 0 && r.estadoEspacio !== "proximo") {
        await Espacios.updateEstado(r.idEspacio, "proximo");
        console.log(`🟡 Espacio ${r.numeroEspacio} marcado como PRÓXIMO (${r.codigoReserva})`);
      }

      // 3️⃣ Si ya estamos dentro del rango de tiempo de la reserva → “ocupado”
      if (ahora.isBetween(horaEntrada, horaSalida) && r.estadoEspacio !== "ocupado") {
        await Espacios.updateEstado(r.idEspacio, "ocupado");
        await Reserva.updateEstado(r.idReserva, "activo");
        console.log(`🟢 Espacio ${r.numeroEspacio} marcado como OCUPADO (${r.codigoReserva})`);
      }

      // 4️⃣ Si ya pasó la hora de salida → liberar espacio y finalizar reserva
      if (ahora.isAfter(horaSalida) && r.estadoEspacio !== "disponible") {
        await Espacios.updateEstado(r.idEspacio, "disponible");
        await Reserva.updateEstado(r.idReserva, "finalizada");
        console.log(`🔵 Espacio ${r.numeroEspacio} liberado (${r.codigoReserva})`);
      }
    }

    console.log("✅ Revisión de reservas completada.\n");
  } catch (error) {
    console.error("🔥 Error en job de reservas:", error.message);
  }
});
