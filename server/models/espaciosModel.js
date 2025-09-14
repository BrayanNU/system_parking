// server/models/espaciosModel.js
const pool = require('../config/db');

async function list() {
  const [rows] = await pool.query('SELECT * FROM espacios ORDER BY numero');
  return rows;
}

async function create({ numero, estado = 'libre', disponible = true }) {
  const [r] = await pool.query(
    'INSERT INTO espacios (numero, estado, disponible) VALUES (?, ?, ?)',
    [numero, estado, disponible]
  );
  return r.insertId;
}

module.exports = { list, create };
