// server/models/pagosModel.js
const db = require("../config/db");

// Obtener todos los pagos con datos de la reserva
exports.getAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      p.idPago, 
      p.idReserva, 
      p.monto, 
      p.metodo, 
      DATE_FORMAT(p.fechaPago, '%d/%m/%Y %H:%i:%s') AS fechaPago,
      p.estado,
      r.nombreCliente, 
      r.apellidoCliente, 
      r.placa
    FROM pagos p
    JOIN reserva r ON p.idReserva = r.idReserva
    ORDER BY p.idPago DESC
  `);
  return rows;
};

// Crear pago
exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO pagos (idReserva, monto, metodo, estado)
     VALUES (?, ?, ?, ?)`,
    [data.idReserva, data.monto, data.metodo, data.estado || "pendiente"]
  );

  const [rows] = await db.query(
    `SELECT 
       p.idPago, p.idReserva, p.monto, p.metodo,
       DATE_FORMAT(p.fechaPago, '%d/%m/%Y %H:%i:%s') AS fechaPago,
       p.estado
     FROM pagos p
     WHERE p.idPago = ?`,
    [result.insertId]
  );

  return rows[0];
};

// Actualizar pago (ej: confirmar o cancelar)

exports.updateByReserva = async (idReserva, data) => {
  // Construimos dinámicamente los campos a actualizar
  const fields = [];
  const values = [];

  // ✅ Ahora también permite actualizar el monto
  if (data.monto !== undefined) {
    fields.push("monto = ?");
    values.push(parseFloat(data.monto).toFixed(2));
  }

  if (data.metodo !== undefined) {
    fields.push("metodo = ?");
    values.push(data.metodo);
  }

  if (data.estado !== undefined) {
    fields.push("estado = ?");
    values.push(data.estado);
  }

  // Fecha de pago: si la mandan, la formateamos, si no, null
  if (data.fechaPago !== undefined) {
    const fechaPago = data.fechaPago
      ? new Date(data.fechaPago).toISOString().slice(0, 19).replace("T", " ")
      : null;
    fields.push("fechaPago = ?");
    values.push(fechaPago);
  }

  // Si no hay nada que actualizar, salimos
  if (fields.length === 0) {
    return null;
  }

  // ✅ Quitamos la restricción del estado si quieres permitir actualizar montos de pagos activos o pendientes
  const sql = `UPDATE pagos SET ${fields.join(", ")} WHERE idReserva = ?`;

  const [result] = await db.query(sql, [...values, idReserva]);

  if (result.affectedRows === 0) {
    return null;
  }

  // Devolvemos el pago actualizado
  const [rows] = await db.query(`SELECT * FROM pagos WHERE idReserva = ?`, [idReserva]);
  return rows[0];
};






// Eliminar pago
exports.remove = async (idPago) => {
  await db.query("DELETE FROM pagos WHERE idPago=?", [idPago]);
};

// Obtener pago por ID
exports.getById = async (idPago) => {
  const [rows] = await db.query(`SELECT * FROM pagos WHERE idPago=?`, [idPago]);
  return rows[0];
};


// Actualizar pago por ID
exports.updateById = async (idPago, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const updates = keys.map((key) => `${key} = ?`).join(", ");

  const sql = `UPDATE pagos SET ${updates} WHERE idPago = ?`;
  await db.query(sql, [...values, idPago]);

  const [rows] = await db.query(`SELECT * FROM pagos WHERE idPago = ?`, [idPago]);
  return rows[0];
};

// Obtener pagos por usuario
exports.getByUsuario = async (id_usuario) => {
  const [rows] = await db.query(`
    SELECT 
      p.idPago, 
      p.idReserva, 
      p.monto, 
      p.metodo, 
      DATE_FORMAT(p.fechaPago, '%d/%m/%Y %H:%i:%s') AS fechaPago,
      p.estado,
      r.id_usuario,
      r.nombreCliente, 
      r.apellidoCliente, 
      r.placa,
      e.numeroEspacio
    FROM pagos p
    JOIN reserva r ON p.idReserva = r.idReserva
    JOIN espacios e ON r.idEspacio = e.idEspacio
    WHERE r.id_usuario = ?
    ORDER BY p.idPago DESC
  `, [id_usuario]);

  return rows;
};
