const db = require("../config/db");
const Reserva = require("../models/reservasModel");
const Espacios = require("../models/espaciosModel");
const Pago = require("../models/pagosModel");
const Tarifas = require("../models/tarifasModel");
const Tickets = require("../models/ticketsModel");
const { v4: uuidv4 } = require("uuid");

// Regex para validaciones
const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;
// Placas válidas en Perú: ABC123, 12A123, B1I201
const regexPlacaPeru = /^([A-Z]{3}[0-9]{3}|[0-9]{3}[A-Z]{3}|[0-9]{2}[A-Z][0-9]{3}|[A-Z][0-9][A-Z][0-9]{3}|M[0-9]{5}|[0-9]{4}-[A-Z]{2}|[A-Z]{2}[0-9]{4})$/;


const regexTelefono = /^[0-9]{9}$/;


// Obtener todas las reservas
exports.getAll = async (req, res) => {
  try {
    const results = await Reserva.getAll();
    const ahora = new Date();

    for (const reserva of results) {
      const horaSalida = new Date(`${reserva.fecha}T${reserva.horaSalida}`);
      if (reserva.estado === "activo" && ahora > horaSalida) {
        await Reserva.update(reserva.idReserva, { estado: "finalizada" });
        await Espacios.updateEstado(reserva.idEspacio, "disponible");
      }
    }

    const reservasConNombreEspacio = await Promise.all(
      results.map(async (reserva) => {
        const espacio = await Espacios.getById(reserva.idEspacio);
        return { ...reserva, numeroEspacio: espacio?.numeroEspacio || "N/A" };
      })
    );

    res.json(reservasConNombreEspacio);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener reservas", detalle: err.message });
  }
};



// Función para validar datos de reserva
function validarDatosReserva({ nombreCliente, apellidoCliente, placa, telefono }) {
  if (nombreCliente && !regexNombre.test(nombreCliente)) {
    return "Nombre inválido, use solo letras.";
  }
  if (apellidoCliente && !regexNombre.test(apellidoCliente)) {
    return "Apellido inválido, use solo letras.";
  }
  if (!regexPlacaPeru.test(placa.toUpperCase())) {
  return "Placa inválida. Ejemplos válidos: BVI321, 01I703, B1I201, X7I202, M12345, 1234-AB.";
  }
  if (telefono && !regexTelefono.test(telefono)) {
    return "El teléfono debe tener exactamente 9 dígitos.";
  }
  return null; // ✅ Todo correcto
}


// Crear reserva presencial (verifica solapamiento de horarios)
exports.create = async (req, res) => {
  try {
    const { nombreCliente, apellidoCliente, placa, telefono, idEspacio, duracionHoras } = req.body;

    // Validaciones generales
    if (!idEspacio || !nombreCliente || !apellidoCliente || !placa || !telefono || !duracionHoras) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const errorValidacion = validarDatosReserva({ nombreCliente, apellidoCliente, placa, telefono });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    // 🧩 Verificar que el espacio exista
    const espacio = await Espacios.getById(idEspacio);
    if (!espacio) {
      return res.status(404).json({ error: "El espacio no existe" });
    }

    // Obtener la tarifa activa
    const tarifa = await Tarifas.getActiva();
    if (!tarifa) {
      return res.status(400).json({ error: "No hay tarifa activa configurada" });
    }

    // 📆 Fecha y hora actual
    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const horaEntrada = ahora.toTimeString().split(" ")[0];
    const salida = new Date(ahora.getTime() + duracionHoras * 60 * 60 * 1000);
    const horaSalida = salida.toTimeString().split(" ")[0];
    const precioTotal = (duracionHoras * tarifa.precio).toFixed(2);

    // 🕐 Validar que no haya otra reserva en el mismo horario
    const [reservasExistentes] = await db.query(
      `SELECT horaEntrada, horaSalida
       FROM reserva
       WHERE idEspacio = ?
       AND fecha = ?
       AND estado IN ('activo', 'pendiente', 'proximo')`,
      [idEspacio, fecha]
    );

    const nuevaEntrada = new Date(`${fecha}T${horaEntrada}`);
    const nuevaSalida = new Date(`${fecha}T${horaSalida}`);

    const hayConflicto = reservasExistentes.some((r) => {
      const entradaExistente = new Date(`${fecha}T${r.horaEntrada}`);
      const salidaExistente = new Date(`${fecha}T${r.horaSalida}`);

      // 🔴 Si los intervalos se cruzan, hay conflicto
      return (
        (nuevaEntrada >= entradaExistente && nuevaEntrada < salidaExistente) ||
        (nuevaSalida > entradaExistente && nuevaSalida <= salidaExistente) ||
        (nuevaEntrada <= entradaExistente && nuevaSalida >= salidaExistente)
      );
    });

    if (hayConflicto) {
      return res.status(409).json({
        error: "El espacio ya tiene una reserva en el horario solicitado. Por favor elige otro horario o espacio.",
      });
    }

    // ✅ Si no hay conflicto, crear la reserva
    const codigoReserva = uuidv4().slice(0, 8);

    const reserva = await Reserva.create({
      codigoReserva,
      idEspacio,
      nombreCliente,
      apellidoCliente,
      placa: placa.toUpperCase(),
      telefono,
      fecha,
      horaEntrada,
      horaSalida,
      estado: "activo",
      precioTotal,
      id_usuario: null, // 🔸 null porque es presencial
    });

    // 🔄 Calcular estado del espacio según proximidad
    const horaEntradaDate = new Date(`${fecha}T${horaEntrada}`);
    const diferenciaMin = Math.floor((horaEntradaDate - ahora) / 60000);
    let nuevoEstadoEspacio = "disponible";

    if (diferenciaMin <= 10 && diferenciaMin > 0) nuevoEstadoEspacio = "proximo";
    else if (diferenciaMin <= 0) nuevoEstadoEspacio = "ocupado";

    await Espacios.updateEstado(idEspacio, nuevoEstadoEspacio);

    // Crear registro de pago
    await Pago.create({
      idReserva: reserva.idReserva,
      monto: precioTotal,
      metodo: "efectivo",
      estado: "pendiente",
    });

    // Crear ticket
    await Tickets.create({
      idReserva: reserva.idReserva,
      codigoQR: reserva.codigoReserva,
      fechaGeneracion: new Date(),
      valido: true,
    });

    res.status(201).json({
      message: "Reserva creada correctamente (sin solapamiento detectado)",
      reserva,
    });
  } catch (err) {
    console.error("❌ Error creando reserva:", err);
    res.status(500).json({ error: "Error creando reserva", detalle: err.message });
  }
};


// Actualizar reserva
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;

    const reservaActual = await Reserva.getById(id);
    if (!reservaActual) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const errorValidacion = validarDatosReserva(datos);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const espacioNuevo = datos.idEspacio;
    const espacioAntiguo = reservaActual.idEspacio;

    if (espacioNuevo && espacioNuevo !== espacioAntiguo) {
      const nuevoEspacio = await Espacios.getById(espacioNuevo);
      if (!nuevoEspacio || nuevoEspacio.estado !== "disponible") {
        return res.status(400).json({ error: "El nuevo espacio no está disponible" });
      }
      await Espacios.updateEstado(espacioAntiguo, "disponible");
      await Espacios.updateEstado(espacioNuevo, "ocupado");
    }

    if (["cancelada", "finalizada"].includes(datos.estado)) {
      await Espacios.updateEstado(espacioNuevo || espacioAntiguo, "disponible");
    }

    if (datos.duracionHoras && datos.horaEntrada && datos.fecha) {
      const entradaStr = `${datos.fecha}T${datos.horaEntrada}`;
      const entradaDate = new Date(entradaStr);
      const duracion = Number(datos.duracionHoras);
      const salidaDate = new Date(entradaDate.getTime() + duracion * 60 * 60 * 1000);
      const horaSalida = salidaDate.toTimeString().split(" ")[0];

      const tarifa = await Tarifas.getActiva();
      if (!tarifa) {
        return res.status(400).json({ error: "No hay tarifa activa configurada" });
      }

      datos.horaSalida = horaSalida;
      datos.precioTotal = (duracion * tarifa.precio).toFixed(2);

      await Pago.updateByReserva(id, {
        monto: datos.precioTotal,
        estado: "pendiente",
      });
    }

    await Reserva.update(id, datos);
    res.json({ message: "Reserva y pago actualizados correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar reserva", detalle: err.message });
  }
};

// Eliminar reserva
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const reserva = await Reserva.getById(id);

    if (reserva && reserva.idEspacio) {
      await Espacios.updateEstado(reserva.idEspacio, "disponible");
    }

    await Reserva.remove(id);
    res.json({ message: "Reserva eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar reserva", detalle: err.message });
  }
};





// Reserva Usuario Cliente 


// Obtener reservas del usuario logueado
exports.getByUsuario = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario; // viene del token JWT

    // Buscar reservas por el usuario
    const reservas = await Reserva.findByUsuario(id_usuario);

    // Agregar info extra (ej. número de espacio)
    const reservasConEspacio = await Promise.all(
      reservas.map(async (reserva) => {
        const espacio = await Espacios.getById(reserva.idEspacio);
        return { 
          ...reserva, 
          numeroEspacio: espacio?.numeroEspacio || "N/A" 
        };
      })
    );

    res.json(reservasConEspacio);
  } catch (err) {
    console.error("Error al obtener reservas del usuario:", err);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

//////////////////////////////////////////////////////////////////////////////

function calcularHoraSalida(horaEntrada, duracionHoras) {
  // horaEntrada: string tipo "HH:MM"
  const [horas, minutos] = horaEntrada.split(":").map(Number);
  const fechaEntrada = new Date();
  fechaEntrada.setHours(horas, minutos, 0, 0);

  const fechaSalida = new Date(fechaEntrada.getTime() + duracionHoras * 60 * 60 * 1000);

  return fechaSalida.toTimeString().split(" ")[0]; // devuelve "HH:MM:SS"
}


function generarCodigo() {
  return uuidv4().slice(0, 8); // ejemplo: "dd721fb6"
}


exports.createCliente = async (req, res) => {
  try {
    const { idEspacio, placa, telefono, fecha, horaEntrada, duracionHoras } = req.body;
    const user = req.user; // Datos del usuario logueado (de JWT)

    // 🔸 Validar campos obligatorios
    if (!idEspacio || !placa || !telefono || !fecha || !horaEntrada || !duracionHoras) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 🔸 Validar formato de placa y teléfono
    const errorValidacion = validarDatosReserva({ placa, telefono });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    // 🔸 Verificar existencia y disponibilidad del espacio
    const espacio = await Espacios.getById(idEspacio);
    if (!espacio) {
      return res.status(404).json({ error: "El espacio no existe" });
    }

    // 🔸 Obtener tarifa activa
    const tarifa = await Tarifas.getActiva();
    if (!tarifa || tarifa.precio == null) {
      return res.status(400).json({ error: "No hay tarifa activa configurada o monto inválido" });
    }

    // 🔸 Validar o asignar nombres
    const nombreCliente = user.nombre?.trim() || "Cliente";
    const apellidoCliente = user.apellido?.trim() || "Anónimo";

    if (!regexNombre.test(nombreCliente)) return res.status(400).json({ error: "Nombre inválido" });
    if (!regexNombre.test(apellidoCliente)) return res.status(400).json({ error: "Apellido inválido" });

    // 🔹 Calcular hora de salida
    const horaSalida = calcularHoraSalida(horaEntrada, Number(duracionHoras));

    // 🔹 Calcular precio total
    const precioTotal = parseFloat((tarifa.precio * Number(duracionHoras)).toFixed(2));

    // 🕐 Validar solapamiento con otras reservas activas o pendientes
    const [reservasExistentes] = await db.query(
      `SELECT horaEntrada, horaSalida
       FROM reserva
       WHERE idEspacio = ?
       AND fecha = ?
       AND estado IN ('activo', 'pendiente', 'proximo')`,
      [idEspacio, fecha]
    );

    const nuevaEntrada = new Date(`${fecha}T${horaEntrada}`);
    const nuevaSalida = new Date(`${fecha}T${horaSalida}`);

    const hayConflicto = reservasExistentes.some((r) => {
      const entradaExistente = new Date(`${fecha}T${r.horaEntrada}`);
      const salidaExistente = new Date(`${fecha}T${r.horaSalida}`);

      // 🔴 Si los intervalos se cruzan, hay conflicto
      return (
        (nuevaEntrada >= entradaExistente && nuevaEntrada < salidaExistente) ||
        (nuevaSalida > entradaExistente && nuevaSalida <= salidaExistente) ||
        (nuevaEntrada <= entradaExistente && nuevaSalida >= salidaExistente)
      );
    });

    if (hayConflicto) {
      return res.status(409).json({
        error: "El espacio ya tiene una reserva en el horario solicitado. Por favor elige otro horario o espacio.",
      });
    }

    // ✅ Si no hay conflicto, crear la reserva
    const codigoReserva = generarCodigo();

    const nuevaReserva = await Reserva.create({
      id_usuario: user.id_usuario,
      idEspacio,
      nombreCliente,
      apellidoCliente,
      placa: placa.toUpperCase(),
      telefono,
      fecha,
      horaEntrada,
      horaSalida,
      codigoReserva,
      estado: "activo",
      precioTotal,
    });

    // 🔄 Calcular diferencia entre hora actual y hora de entrada
    const ahora = new Date();
    const horaEntradaDate = new Date(`${fecha}T${horaEntrada}`);
    const diferenciaMin = Math.floor((horaEntradaDate - ahora) / 60000);

    let nuevoEstadoEspacio = "disponible";
    if (diferenciaMin <= 10 && diferenciaMin > 0) nuevoEstadoEspacio = "proximo";
    else if (diferenciaMin <= 0) nuevoEstadoEspacio = "ocupado";

    // 🔄 Actualizar estado del espacio
    await Espacios.updateEstado(idEspacio, nuevoEstadoEspacio);

    // 💳 Crear registro de pago
    await Pago.create({
      idReserva: nuevaReserva.idReserva,
      monto: precioTotal,
      metodo: "pendiente",
      estado: "pendiente",
    });

    // 🎟 Crear ticket
    await Tickets.create({
      idReserva: nuevaReserva.idReserva,
      codigoQR: codigoReserva,
      fechaGeneracion: new Date(),
      valido: true,
    });

    res.status(201).json({
      message: "Reserva de cliente creada correctamente (sin solapamiento detectado)",
      reserva: nuevaReserva,
    });

  } catch (err) {
    console.error("Error al crear reserva de cliente:", err);
    res.status(500).json({ error: "Error al crear reserva de cliente", detalle: err.message });
  }
};
