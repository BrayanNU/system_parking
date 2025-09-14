// server/controllers/espaciosController.js
const db = require("../config/db");

// Obtener todos los espacios
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM espacios");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener espacios" });
  }
};



// Obtener solo los espacios libres
exports.getLibres = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM espacios WHERE estado = 'libre'");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener espacios libres:", err);
    res.status(500).json({ error: "Error al obtener espacios libres" });
  }
};



// Crear un espacio
exports.create = async (req, res) => {
  try {
    const { numeroEspacio, estado = "libre" } = req.body;
    if (!numeroEspacio) return res.status(400).json({ error: "Número requerido" });

    const [result] = await db.query(
      "INSERT INTO espacios (numeroEspacio, estado) VALUES (?, ?)",
      [numeroEspacio, estado]
    );

    res.status(201).json({ idEspacio: result.insertId, numeroEspacio, estado });
  } catch (err) {
    res.status(500).json({ error: "Error al crear espacio" });
  }
};

// Cambiar estado de un espacio
exports.updateEstado = async (idEspacio, nuevoEstado) => {
  try {
    await db.query("UPDATE espacios SET estado=? WHERE idEspacio=?", [
      nuevoEstado,
      idEspacio,
    ]);
  } catch (err) {
    console.error("Error al actualizar estado del espacio:", err);
  }
};

// Actualizar espacio
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { numeroEspacio, estado } = req.body;

    await db.query(
      "UPDATE espacios SET numeroEspacio=?, estado=? WHERE idEspacio=?",
      [numeroEspacio, estado, id]
    );

    res.json({ message: "Espacio actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar espacio" });
  }
};

// Eliminar espacio
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("DELETE FROM espacios WHERE idEspacio=?", [id]);
    res.json({ message: "Espacio eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar espacio" });
  }
};
