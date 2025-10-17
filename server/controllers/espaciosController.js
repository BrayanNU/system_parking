// server/controllers/espaciosController.js
const Espacios = require("../models/espaciosModel");

// Obtener todos los espacios
exports.getAll = async (req, res) => {
  try {
    const rows = await Espacios.list();
    res.json(rows);
  } catch (err) {
    console.error("Error en getAll:", err);
    res.status(500).json({ error: "Error al obtener espacios" });
  }
};

// Obtener espacios libres (con opción de incluir un idEspacio específico)
exports.getLibres = async (req, res) => {
  try {
    const { incluir } = req.query; // ej: ?incluir=5
    const espacios = await Espacios.list();

    let libres = espacios.filter(e => e.estado === "disponible");

    // Si se pasa un idEspacio en ?incluir, lo agregamos si no está en la lista
    if (incluir) {
      const yaIncluido = libres.some(e => e.idEspacio === parseInt(incluir));
      if (!yaIncluido) {
        const espacioActual = espacios.find(e => e.idEspacio === parseInt(incluir));
        if (espacioActual) {
          libres.push({
            ...espacioActual,
            estado: `${espacioActual.estado} (actual)`, // para mostrarlo en el dropdown
          });
        }
      }
    }

    res.json(libres);
  } catch (err) {
    console.error("Error en getLibres:", err);
    res.status(500).json({ error: "Error al obtener espacios libres" });
  }
};

// Crear un espacio
exports.create = async (req, res) => {
  try {
    const { numeroEspacio } = req.body;
    if (!numeroEspacio) return res.status(400).json({ error: "Número requerido" });

    const idEspacio = await Espacios.create({ numeroEspacio });
    res.status(201).json({ idEspacio, numeroEspacio, estado: "disponible" });
  } catch (err) {
    console.error("Error en create:", err);
    res.status(500).json({ error: "Error al crear espacio" });
  }
};

// Actualizar un espacio
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { numeroEspacio, estado } = req.body;

    await Espacios.update(id, { numeroEspacio, estado });
    res.json({ message: "Espacio actualizado correctamente" });
  } catch (err) {
    console.error("Error en update:", err);
    res.status(500).json({ error: "Error al actualizar espacio" });
  }
};

// Eliminar un espacio
exports.remove = async (req, res) => {
  try {
    await Espacios.remove(req.params.id);
    res.json({ message: "Espacio eliminado correctamente" });
  } catch (err) {
    console.error("Error en remove:", err);
    res.status(500).json({ error: "Error al eliminar espacio" });
  }
};


// Espacios para cliente (solo disponibles)
exports.getLibresCliente = async (req, res) => {
  try {
    const espacios = await Espacios.list();
    const libres = espacios.filter(e => e.estado === "disponible");
    res.json(libres);
  } catch (err) {
    console.error("Error en getLibresCliente:", err);
    res.status(500).json({ error: "Error al obtener espacios libres para cliente" });
  }
};

// Espacios para cliente (todos, sin auth)
exports.getAllPublic = async (req, res) => {
  try {
    const espacios = await Espacios.list();
    res.json(espacios);
  } catch (err) {
    console.error("Error al obtener espacios públicos:", err);
    res.status(500).json({ error: "Error al obtener los espacios públicos" });
  }
};
