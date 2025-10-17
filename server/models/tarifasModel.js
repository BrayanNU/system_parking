// server/models/tarifasModel.js
const db = require("../config/db");

// Listar todas las tarifas
exports.getAll = async () => {
  const [rows] = await db.query("SELECT * FROM tarifas ORDER BY idTarifa DESC");
  return rows;
};

// Obtener tarifa activa
exports.getActiva = async () => {
  const [rows] = await db.query("SELECT * FROM tarifas WHERE activa = 1 LIMIT 1");
  return rows[0];
};

// Crear nueva tarifa
exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO tarifas (dTarifa, descripcion, precio, unidad, activa) 
     VALUES (?, ?, ?, ?, ?)`,
    [data.dTarifa, data.descripcion, data.precio, data.unidad, data.activa || 0]
  );
  const [rows] = await db.query("SELECT * FROM tarifas WHERE idTarifa = ?", [result.insertId]);
  return rows[0];
};

// Actualizar tarifa
exports.update = async (id, data) => {
  await db.query(
    `UPDATE tarifas SET dTarifa=?, descripcion=?, precio=?, unidad=?, activa=? WHERE idTarifa=?`,
    [data.dTarifa, data.descripcion, data.precio, data.unidad, data.activa || 0, id]
  );
  const [rows] = await db.query("SELECT * FROM tarifas WHERE idTarifa = ?", [id]);
  return rows[0];
};

// Eliminar tarifa
exports.remove = async (id) => {
  await db.query("DELETE FROM tarifas WHERE idTarifa = ?", [id]);
};

// Desactivar todas las tarifas
exports.desactivarTodas = async () => {
  await db.query("UPDATE tarifas SET activa = 0");
};
