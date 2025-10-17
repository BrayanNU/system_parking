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

exports.create_cli = async (data) => {
  await db.query(
    `INSERT INTO usuarios (nombre, apellido, telefono, correo, contrasena, rol, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.apellido,
      data.telefono,
      data.correo,
      data.contrasena,
      "cliente", // 👈 se asigna automáticamente este rol
      "activo",
    ]
  );

  // Ya no hay necesidad de la consulta SELECT
  return { message: 'Usuario creado exitosamente' };  // O lo que desees devolver
};


// Obtener usuario por ID
exports.getById = async (id) => {
  const [rows] = await db.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id]);
  return rows[0];
};

// Actualizar usuario
exports.update = async (id, data) => {
  const fields = ["nombre = ?", "apellido = ?", "correo = ?", "rol = ?", "estado = ?"];
  const values = [data.nombre, data.apellido, data.correo, data.rol, data.estado];

  if (data.contrasena) {
    fields.push("contrasena = ?");
    values.push(data.contrasena);
  }

  values.push(id);
  const sql = `UPDATE usuarios SET ${fields.join(", ")} WHERE id_usuario = ?`;
  await db.query(sql, values);
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


exports.saveVerification = async (correo, codigo, expiresAt) => {
  await db.query(
    `INSERT INTO verification_codes (correo, codigo, expires_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE codigo = VALUES(codigo), expires_at = VALUES(expires_at), created_at = CURRENT_TIMESTAMP`,
    [correo, codigo, expiresAt]
  );
};

exports.getVerification = async (correo) => {
  const [rows] = await db.query(
    `SELECT * FROM verification_codes WHERE correo = ? LIMIT 1`,
    [correo]
  );
  return rows[0];
};

exports.deleteVerification = async (correo) => {
  await db.query(`DELETE FROM verification_codes WHERE correo = ?`, [correo]);
};

// Guardar token de restablecimiento de contraseña
exports.saveResetToken = async (correo, token, expiresAt) => {
  await db.query(
    `INSERT INTO password_resets (correo, token, expires_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = CURRENT_TIMESTAMP`,
    [correo, token, expiresAt]
  );
};

// Obtener token de restablecimiento
exports.getResetToken = async (token) => {
  const [rows] = await db.query(
    `SELECT * FROM password_resets WHERE token = ? LIMIT 1`,
    [token]
  );
  return rows[0];
};

// Eliminar token una vez usado
exports.deleteResetToken = async (correo) => {
  await db.query(`DELETE FROM password_resets WHERE correo = ?`, [correo]);
};

exports.updatePassword = async (id_usuario, nuevaContrasena) => {
  await db.query(
    "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?",
    [nuevaContrasena, id_usuario]
  );
};
