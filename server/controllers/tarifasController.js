// server/controllers/tarifasController.js
const Tarifas = require("../models/tarifasModel");

// Obtener todas las tarifas
exports.getAll = async (req, res) => {
  try {
    const tarifas = await Tarifas.getAll();
    res.json(tarifas);
  } catch (err) {
    console.error("Error en getAll tarifas:", err);
    res.status(500).json({ error: "Error al obtener tarifas" });
  }
};

// Obtener la tarifa activa
exports.getActiva = async (req, res) => {
  try {
    const tarifa = await Tarifas.getActiva();
    if (!tarifa) {
      return res.status(404).json({ error: "No hay tarifa activa" });
    }
    res.json(tarifa);
  } catch (err) {
    console.error("Error en getActiva tarifa:", err);
    res.status(500).json({ error: "Error al obtener la tarifa activa" });
  }
};

// Crear tarifa
exports.create = async (req, res) => {
  try {
    const { dTarifa, descripcion, precio, unidad, activa } = req.body;

    if (!dTarifa || !descripcion || !precio || !unidad) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Si la nueva tarifa es activa, desactiva las demás
    if (activa) {
      await Tarifas.desactivarTodas();
    }

    const nuevaTarifa = await Tarifas.create({
      dTarifa,
      descripcion,
      precio,
      unidad,
      activa: activa ? 1 : 0,
    });

    res.status(201).json(nuevaTarifa);
  } catch (err) {
    console.error("Error en create tarifa:", err);
    res.status(500).json({ error: "Error al crear tarifa" });
  }
};

// Actualizar tarifa
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;

    // Si esta tarifa se marca como activa, desactiva las demás
    if (datos.activa) {
      await Tarifas.desactivarTodas();
    }

    const tarifaActualizada = await Tarifas.update(id, datos);

    if (!tarifaActualizada) {
      return res.status(404).json({ error: "Tarifa no encontrada" });
    }

    res.json(tarifaActualizada);
  } catch (err) {
    console.error("Error en update tarifa:", err);
    res.status(500).json({ error: "Error al actualizar tarifa" });
  }
};

// Eliminar tarifa
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await Tarifas.remove(id);
    res.json({ message: "Tarifa eliminada correctamente" });
  } catch (err) {
    console.error("Error en remove tarifa:", err);
    res.status(500).json({ error: "Error al eliminar tarifa" });
  }
};

// server/controllers/tarifasController.js
exports.getActivaCl = async (req, res) => {
  try {
    const tarifa = await Tarifas.getActiva(); // tu modelo debe tener esta lógica
    res.json(tarifa || {});
  } catch (err) {
    console.error("Error en getActivaCl:", err);
    res.status(500).json({ error: "Error al obtener tarifa activa (cliente)" });
  }
};
