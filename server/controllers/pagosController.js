const Pago = require("../models/pagosModel");
const Reserva = require("../models/reservasModel");
const Espacio = require("../models/espaciosModel");

// Crear nuevo pago (ADMIN)
exports.create = async (req, res) => {
  try {
    const data = req.body;
    const nuevoPago = await Pago.create(data);
    res.status(201).json(nuevoPago);
  } catch (err) {
    console.error("Error al crear pago:", err);
    res.status(500).json({ error: "Error al crear pago" });
  }
};

// Actualizar pago por ID de pago (ADMIN)
exports.update = async (req, res) => {
  try {
    const idPago = req.params.id;
    const { metodo, estado, fechaPago } = req.body;

    // Validar estado
    const estadosValidos = ["pendiente", "pagado", "cancelado"];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(", ")}`,
      });
    }

    // Actualizar el pago
    const pago = await Pago.updateById(idPago, { metodo, estado, fechaPago });
    if (!pago) return res.status(404).json({ error: "Pago no encontrado" });

    // Obtener reserva relacionada
    const reserva = await Reserva.getById(pago.idReserva);
    if (!reserva) return res.status(404).json({ error: "Reserva no encontrada" });

    // Cambiar estado de reserva y espacio según pago
    if (estado === "cancelado") {
      await Reserva.updateEstado(reserva.idReserva, "cancelado");
      await Espacio.update(reserva.idEspacio, { estado: "disponible" });
    } else if (estado === "confirmado" || estado === "pagado") {
      await Reserva.updateEstado(reserva.idReserva, "confirmada");
      await Espacio.update(reserva.idEspacio, { estado: "ocupado" });
    }

    res.json({ message: "Pago actualizado correctamente", pago });

  } catch (err) {
    console.error("Error al actualizar pago:", err);
    res.status(500).json({ error: "Error al actualizar pago" });
  }
};

// Actualizar pago por ID de reserva (CLIENTE)
const updateByReserva = async (req, res) => {
  const { idReserva } = req.params;
  const { metodo } = req.body;

  try {
    const pagoActualizado = await Pago.updateByReserva(idReserva, {
      metodo,
      estado: 'pagado',
      fechaPago: new Date(),
    });

    if (!pagoActualizado) {
      return res.status(404).json({ error: "No se encontró pago pendiente para esa reserva" });
    }

    //await Reserva.sincronizarEstadoReserva(idReserva, 'pagado');

    //const reserva = await Reserva.getById(idReserva);
    //if (reserva) {
    //  await Espacio.updateByReserva(idReserva, { estado: "ocupado" }); // asegúrate que esta función existe
    //}

    return res.status(200).json({ message: "Pago actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error en updateByReserva:", error);
    return res.status(500).json({ error: "Error al actualizar el pago" });
  }
};




// Obtener todos los pagos (ADMIN)
exports.getAll = async (req, res) => {
  try {
    const pagos = await Pago.getAll();
    res.json(pagos);
  } catch (err) {
    console.error("Error al obtener pagos:", err);
    res.status(500).json({ error: "Error al obtener pagos" });
  }
};

// Eliminar pago (ADMIN)
exports.remove = async (req, res) => {
  try {
    await Pago.remove(req.params.id);
    res.json({ message: "Pago eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar pago:", err);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
};

// Obtener pagos por usuario (CLIENTE)
exports.getByUsuario = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const pagos = await Pago.getByUsuario(idUsuario);
    res.json(pagos);
  } catch (err) {
    console.error("❌ Error en getByUsuario:", err);
    res.status(500).json({ error: "Error al obtener pagos por usuario" });
  }
};

// Obtener reservas pendientes (CLIENTE)
const getReservasPendientes = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;

    const reservas = await Reserva.getPendientesPorUsuario(id_usuario); // Debes implementar esta función en reservasModel.js

    res.json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas pendientes:", error);
    res.status(500).json({ error: "Error al obtener reservas pendientes" });
  }
};

// Exportar todo
module.exports = {
  create: exports.create,
  update: exports.update,
  updateByReserva,
  getAll: exports.getAll,
  remove: exports.remove,
  getByUsuario: exports.getByUsuario,
  getReservasPendientes
};
