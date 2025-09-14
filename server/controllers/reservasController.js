const Reserva = require("../models/reservasModel");
const Espacios = require("./espaciosController");
const moment = require("moment");
const db = require("../config/db");

// Obtener todas las reservas (actualiza estados vencidos)
exports.getAll = async (req, res) => {
  try {
    const results = await Reserva.getAll();
    const ahora = new Date();

    for (const reserva of results) {
      const horaSalida = new Date(`${reserva.fecha}T${reserva.horaSalida}`);
      if (reserva.estado === "activa" && ahora > horaSalida) {
        await Reserva.update(reserva.idReserva, { estado: "finalizada" });
        await Espacios.updateEstado(reserva.idEspacio, "libre");
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Error en getAll:", err);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

// Crear reserva
exports.create = async (req, res) => {
  try {
    const nuevaReserva = req.body;

    // Generar código aleatorio si no existe
    if (!nuevaReserva.codigoReserva) {
      const prefix = "A";
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      nuevaReserva.codigoReserva = `${prefix}${randomNum}`;
    }

    // Hora de entrada y salida
    const horaEntrada = moment().format("HH:mm:ss");
    const horaSalida = moment()
      .add(Number(nuevaReserva.duracionHoras), "hours")
      .format("HH:mm:ss");

    // ✅ Obtener tarifa desde la BD (usamos la primera o activa)
    const [tarifa] = await db.query("SELECT precio FROM tarifas LIMIT 1");
    if (!tarifa.length) {
      return res.status(400).json({ error: "No existe ninguna tarifa configurada" });
    }

    const precioHora = tarifa[0].precio;
    const precioTotal = precioHora * Number(nuevaReserva.duracionHoras);

    const reservaData = {
      ...nuevaReserva,
      horaEntrada,
      horaSalida,
      estado: "activa",
      precioTotal,
    };

    const result = await Reserva.create(reservaData);

    // Marcar espacio ocupado
    await Espacios.updateEstado(nuevaReserva.idEspacio, "ocupado");

    res.status(201).json({ id: result.insertId, ...reservaData });
  } catch (error) {
    console.error("Error creando reserva:", error);
    res.status(500).json({ error: "Error al crear reserva" });
  }
};

// Actualizar reserva
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;

    await Reserva.update(id, datos);

    if (["finalizada", "cancelada"].includes(datos.estado)) {
      await Espacios.updateEstado(datos.idEspacio, "libre");
    }

    res.json({ message: "Reserva actualizada correctamente" });
  } catch (err) {
    console.error("Error en update:", err);
    res.status(500).json({ error: "Error al actualizar reserva" });
  }
};

// Eliminar reserva
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const reserva = await Reserva.getById(id);

    if (reserva && reserva.idEspacio) {
      await Espacios.updateEstado(reserva.idEspacio, "libre");
    }

    await Reserva.remove(id);
    res.json({ message: "Reserva eliminada correctamente" });
  } catch (err) {
    console.error("Error en remove:", err);
    res.status(500).json({ error: "Error al eliminar reserva" });
  }
};
