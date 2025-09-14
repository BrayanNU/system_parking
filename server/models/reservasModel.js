// server/models/reservasModel.js
const db = require("../config/db");

// Obtener todas las reservas
exports.getAll = async () => {
  const [rows] = await db.query(`
    SELECT r.*, e.numeroEspacio AS numeroEspacio
    FROM reserva r
    JOIN espacios e ON r.idEspacio = e.idEspacio
    ORDER BY r.idReserva DESC
  `);
  return rows;
};

// Crear reserva
exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO reserva 
     (idEspacio, nombreCliente, apellidoCliente, placa, tipo, fecha, horaEntrada, horaSalida, codigoReserva, estado, precioTotal) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.idEspacio,
      data.nombreCliente,
      data.apellidoCliente,
      data.placa,
      data.tipo,
      data.fecha,
      data.horaEntrada,
      data.horaSalida,
      data.codigoReserva,
      data.estado || "activa",
      data.precioTotal,
    ]
  );
  return result;
};

// Actualizar reserva
exports.update = async (id, data) => {
  await db.query(
    `UPDATE reserva 
     SET idEspacio=?, nombreCliente=?, apellidoCliente=?, placa=?, tipo=?, fecha=?, horaEntrada=?, horaSalida=?, estado=?, precioTotal=? 
     WHERE idReserva=?`,
    [
      data.idEspacio,
      data.nombreCliente,
      data.apellidoCliente,
      data.placa,
      data.tipo,
      data.fecha,
      data.horaEntrada,
      data.horaSalida,
      data.estado,
      data.precioTotal,
      id,
    ]
  );
};

// Obtener reserva por id
exports.getById = async (id) => {
  const [rows] = await db.query("SELECT * FROM reserva WHERE idReserva=?", [id]);
  return rows[0];
};

// Eliminar reserva
exports.remove = async (id) => {
  await db.query("DELETE FROM reserva WHERE idReserva=?", [id]);
};
