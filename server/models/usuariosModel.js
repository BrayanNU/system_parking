const db = require("../config/db");

// Obtener todos los usuarios
exports.getAll = async () => {
  const [rows] = await db.query("SELECT * FROM usuarios ORDER BY id_usuario DESC");
  return rows;
};

// Crear usuario
exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.nombre, data.apellido, data.correo, data.contrasena, data.rol, data.estado || "activo"]
  );
  return result;
};

// Obtener usuario por ID
exports.getById = async (id) => {
  const [rows] = await db.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id]);
  return rows[0];
};

// Actualizar usuario
exports.update = async (id, data) => {
  await db.query(
    `UPDATE usuarios SET nombre=?, apellido=?, correo=?, rol=?, estado=? 
     WHERE id_usuario=?`,
    [data.nombre, data.apellido, data.correo, data.rol, data.estado, id]
  );
};

// Eliminar usuario
exports.remove = async (id) => {
  await db.query("DELETE FROM usuarios WHERE id_usuario=?", [id]);
};

// Buscar por correo (para login)
exports.getByCorreo = async (correo) => {
  const [rows] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
  return rows[0];
};
