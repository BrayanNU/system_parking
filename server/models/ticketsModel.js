// server/models/ticketsModel.js
const db = require("../config/db");

exports.create = async ({ idReserva, codigoQR }) => {
  const [result] = await db.query(
    `INSERT INTO tickets (idReserva, codigoQR, fechaGeneracion, valido) 
     VALUES (?, ?, NOW(), 1)`,
    [idReserva, codigoQR]
  );
  return result.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query("SELECT * FROM tickets");
  return rows;
};

exports.getById = async (idTicket) => {
  const [rows] = await db.query("SELECT * FROM tickets WHERE idTicket = ?", [idTicket]);
  return rows[0];
};

exports.getByReserva = async (idReserva) => {
  const [rows] = await db.query("SELECT * FROM tickets WHERE idReserva = ?", [idReserva]);
  return rows[0];
};

exports.remove = async (idTicket) => {
  await db.query("DELETE FROM tickets WHERE idTicket = ?", [idTicket]);
  return true;
};
