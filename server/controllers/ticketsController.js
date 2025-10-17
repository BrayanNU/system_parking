// server/controllers/ticketsController.js
const Tickets = require("../models/ticketsModel");
const Reserva = require("../models/reservasModel");

exports.getAll = async (req, res) => {
  try {
    const tickets = await Tickets.getAll();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener tickets", detalle: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const ticket = await Tickets.getById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ticket", detalle: err.message });
  }
};

exports.getByReserva = async (req, res) => {
  try {
    const { idReserva } = req.params;
    const ticket = await Tickets.getByReserva(idReserva);

    if (!ticket) {
      return res.status(404).json({ error: "No existe ticket para esta reserva" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ticket", detalle: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Tickets.remove(req.params.id);
    res.json({ message: "Ticket eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar ticket", detalle: err.message });
  }
};
