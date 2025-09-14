// server/models/usuariosModel.js
const pool = require('../config/db');

async function findByEmail(correo) {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE correo = ? LIMIT 1',
    [correo]
  );
  return rows[0];
}

async function getById(id) {
  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, apellido, correo, rol, estado FROM usuarios WHERE id_usuario = ? LIMIT 1',
    [id]
  );
  return rows[0];
}

async function create({ nombre, apellido, correo, contrasenaHash }) {
  const [r] = await pool.query(
    'INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, estado) VALUES (?, ?, ?, ?, "admin", "activo")',
    [nombre, apellido, correo, contrasenaHash]
  );
  return r.insertId;
}

module.exports = { findByEmail, getById, create };
