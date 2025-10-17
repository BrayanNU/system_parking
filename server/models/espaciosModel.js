const pool = require('../config/db');

// Listar todos los espacios
async function list() {
  const [rows] = await pool.query('SELECT * FROM espacios ORDER BY numeroEspacio');
  return rows;
}

// Crear un espacio
async function create({ numeroEspacio, estado = 'disponible' }) {
  const [r] = await pool.query(
    'INSERT INTO espacios (numeroEspacio, estado) VALUES (?, ?)',
    [numeroEspacio, estado]
  );
  return r.insertId;
}

// Buscar un espacio por ID
async function getById(idEspacio) {
  const [rows] = await pool.query('SELECT * FROM espacios WHERE idEspacio=?', [idEspacio]);
  return rows[0];
}

// Eliminar
async function remove(idEspacio) {
  await pool.query('DELETE FROM espacios WHERE idEspacio=?', [idEspacio]);
}

// Actualizar un espacio completo (cambia número y estado)
async function update(idEspacio, { numeroEspacio, estado }) {
  await pool.query(
    "UPDATE espacios SET numeroEspacio=?, estado=? WHERE idEspacio=?",
    [numeroEspacio, estado, idEspacio]
  );
}

// ⚡ Nuevo: actualizar SOLO el estado
async function updateEstado(idEspacio, estado) {
  await pool.query("UPDATE espacios SET estado=? WHERE idEspacio=?", [estado, idEspacio]);
}




const db = require("../config/db");

// models/espaciosModel.js
async function updateByReserva(idReserva, { estado }) {
  const [reservaRows] = await db.query(
    "SELECT idEspacio FROM reserva WHERE idReserva = ?",
    [idReserva]
  );

  if (reservaRows.length === 0) {
    throw new Error("Reserva no encontrada");
  }

  const idEspacio = reservaRows[0].idEspacio;

  if (!estado) {
    throw new Error("Estado requerido para actualizar espacio");
  }

  const [result] = await db.query(
    "UPDATE espacios SET estado = ? WHERE idEspacio = ?",
    [estado, idEspacio]
  );

  return result.affectedRows > 0;
}




module.exports = { list, create, getById, remove, update, updateEstado, updateByReserva };