require("dotenv").config();
const cron = require("node-cron");
const moment = require("moment-timezone");
const Reserva = require("../models/reservasModel");
const Espacios = require("../models/espaciosModel");
const Usuarios = require("../models/usuariosModel");
const ReservasAuto = require("../controllers/reservasController"); // o ajusta ruta si creas nuevo archivo
const {
  enviarCorreoInicio,
  enviarCorreoProximo,
  enviarCorreoCasiTermina,
} = require("../../src/utils/notificaciones");

console.log("🚀 Servicio de control automático de reservas iniciado...");

// 🕒 Se ejecuta cada minuto
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Ejecutando revisión automática de reservas...");

    const reservas = await Reserva.getAllActivas();
    if (!reservas.length) {
      console.log("📭 No hay reservas activas o próximas en este momento.");
      return;
    }

    const ahora = moment().tz("America/Lima");
    console.log(`🕐 Hora actual (Lima): ${ahora.format("YYYY-MM-DD HH:mm:ss")}`);

    for (const r of reservas) {
      // 🧩 Formatear fecha correctamente (YYYY-MM-DD)
      const fechaISO = r.fecha.split("/").reverse().join("-");
      const horaEntrada = moment.tz(`${fechaISO} ${r.horaEntrada}`, "YYYY-MM-DD HH:mm:ss", "America/Lima");
      let horaSalida = moment.tz(`${fechaISO} ${r.horaSalida}`, "YYYY-MM-DD HH:mm:ss", "America/Lima");

      // Si la salida es menor que la entrada, pasa al día siguiente
      if (horaSalida.isBefore(horaEntrada)) {
        horaSalida.add(1, "day");
      }

      console.log(`📅 Reserva ${r.codigoReserva} | Entrada: ${horaEntrada.format("HH:mm:ss")} | Salida: ${horaSalida.format("HH:mm:ss")}`);

      const diffEntrada = horaEntrada.diff(ahora, "minutes");
      const diffSalida = horaSalida.diff(ahora, "minutes");

      console.log(`➡️ Diferencias -> Entrada: ${diffEntrada} min | Salida: ${diffSalida} min`);

      // 📧 Obtener correo del cliente
      let correoCliente = null;
      if (r.id_usuario) {
        const usuario = await Usuarios.getById(r.id_usuario);
        correoCliente = usuario?.correo || null;
      }

      // 1️⃣ Faltan menos de 10 minutos para el inicio
      if (diffEntrada <= 10 && diffEntrada > 0 && !r.avisoProximo) {
        await Espacios.updateEstado(r.idEspacio, "proximo");
        await Reserva.updateAuto(r.idReserva, { avisoProximo: 1, estado: "pendiente" });
        console.log(`🟡 Espacio ${r.numeroEspacio} marcado como PRÓXIMO (${r.codigoReserva})`);

        if (correoCliente) {
          await enviarCorreoProximo(r, correoCliente);
          console.log(`📧 Correo de aviso PRÓXIMO enviado a ${correoCliente}`);
        }
      }

      // 2️⃣ La reserva ya comenzó
      if (ahora.isBetween(horaEntrada, horaSalida) && !r.avisoInicio) {
        await Espacios.updateEstado(r.idEspacio, "ocupado");
        await Reserva.updateAuto(r.idReserva, { estado: "activo", avisoInicio: 1 });
        console.log(`🟢 Espacio ${r.numeroEspacio} marcado como OCUPADO (${r.codigoReserva})`);

        if (correoCliente) {
          await enviarCorreoInicio(r, correoCliente);
          console.log(`📧 Correo de INICIO enviado a ${correoCliente}`);
        }
      }

      // 3️⃣ Faltan menos de 10 minutos para finalizar
      if (diffSalida <= 10 && diffSalida > 0 && r.estado === "activo" && !r.avisoCasiTermina) {
        await Reserva.updateAuto(r.idReserva, { avisoCasiTermina: 1 });
        console.log(`🕓 Reserva ${r.codigoReserva} está por finalizar en menos de 10 minutos.`);

        if (correoCliente) {
          await enviarCorreoCasiTermina(r, correoCliente);
          console.log(`📧 Correo de CASI TERMINA enviado a ${correoCliente}`);
        }
      }

      // 4️⃣ Ya pasó la hora de salida
      if (ahora.isAfter(horaSalida) && r.estado !== "finalizada") {
        await Espacios.updateEstado(r.idEspacio, "disponible");
        await Reserva.updateAuto(r.idReserva, { estado: "finalizada" });
        console.log(`🔵 Espacio ${r.numeroEspacio} liberado (${r.codigoReserva})`);
      }
    }

    console.log("✅ Revisión de reservas completada.\n");
  } catch (error) {
    console.error("🔥 Error en job de reservas:", error.message);
  }
});
