// server/models/tarifasModel.js
const pool = require('../config/db');

async function list() {
  const [rows] = await pool.query('SELECT * FROM tarifas WHERE activa = 1');
  return rows;
}

async function create({ descripcion, precio, unidad }) {
  const [r] = await pool.query(
    'INSERT INTO tarifas (descripcion, precio, unidad, activa) VALUES (?, ?, ?, 1)',
    [descripcion, precio, unidad]
  );
  return r.insertId;
}

module.exports = { list, create };
