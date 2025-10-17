// server/models/clientesModel.js
const db = require("../config/db");

// Obtener todos los clientes
exports.getAll = async () => {
  const [rows] = await db.query(
    "SELECT * FROM usuarios WHERE rol = 'cliente' ORDER BY id_usuario DESC"
  );
  return rows;
};

// Obtener cliente por id
exports.getById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM usuarios WHERE id_usuario = ? AND rol = 'cliente'",
    [id]
  );
  return rows[0];
};

// Crear cliente (rol forzado a 'cliente')
exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, estado)
     VALUES (?, ?, ?, ?, 'cliente', ?)`,
    [data.nombre, data.apellido, data.correo, data.contrasena, data.estado || "activo"]
  );
  return result;
};

// Actualizar cliente (no cambia rol)
exports.update = async (id, data) => {
  await db.query(
    `UPDATE usuarios SET nombre=?, apellido=?, correo=?, estado=? WHERE id_usuario=? AND rol='cliente'`,
    [data.nombre, data.apellido, data.correo, data.estado, id]
  );
};

// Eliminar cliente
exports.remove = async (id) => {
  await db.query("DELETE FROM usuarios WHERE id_usuario=? AND rol='cliente'", [id]);
};
