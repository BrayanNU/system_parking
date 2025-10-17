// server/models/reservasModel.js
const db = require("../config/db");

// Obtener todas las reservas
exports.getAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      r.idReserva,
      r.codigoReserva,
      r.idEspacio,
      r.nombreCliente,
      r.apellidoCliente,
      r.placa,
      r.telefono,
      DATE_FORMAT(r.fecha, '%d/%m/%Y') AS fecha,
      COALESCE(TIME_FORMAT(r.horaEntrada, '%H:%i:%s'), '') AS horaEntrada,
COALESCE(TIME_FORMAT(r.horaSalida, '%H:%i:%s'), '') AS horaSalida,
      r.estado,
      r.precioTotal,
      e.numeroEspacio AS numeroEspacio
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
     (id_usuario, idEspacio, nombreCliente, apellidoCliente, placa, telefono, fecha, horaEntrada, horaSalida, codigoReserva, estado, precioTotal) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id_usuario || null,
      data.idEspacio,
      data.nombreCliente,
      data.apellidoCliente,
      data.placa,
      data.telefono,
      data.fecha, // se espera "YYYY-MM-DD"
      data.horaEntrada,
      data.horaSalida,
      data.codigoReserva,
      data.estado || "activo",
      data.precioTotal,
    ]
  );

  const [rows] = await db.query(
    `SELECT 
       r.idReserva, r.codigoReserva, r.id_usuario, r.idEspacio, r.nombreCliente, r.apellidoCliente, r.placa, r.telefono,
       DATE_FORMAT(r.fecha, '%d/%m/%Y') AS fecha,
       COALESCE(TIME_FORMAT(r.horaEntrada, '%H:%i:%s'), '') AS horaEntrada,
COALESCE(TIME_FORMAT(r.horaSalida, '%H:%i:%s'), '') AS horaSalida,
       r.estado, r.precioTotal,
       e.numeroEspacio
     FROM reserva r
     JOIN espacios e ON r.idEspacio = e.idEspacio
     WHERE r.idReserva = ?`,
    [result.insertId]
  );

  return rows[0];
};

// Actualizar reserva
exports.update = async (id, data) => {
  const reservaActual = await exports.getById(id);
  if (!reservaActual) {
    throw new Error("Reserva no encontrada");
  }

  const {
    idEspacio = reservaActual.idEspacio,
    nombreCliente = reservaActual.nombreCliente,
    apellidoCliente = reservaActual.apellidoCliente,
    placa = reservaActual.placa,
    telefono = reservaActual.telefono,
    fecha = reservaActual.fecha, // OJO: aquí se espera "YYYY-MM-DD"
    horaEntrada = reservaActual.horaEntrada,
    horaSalida = reservaActual.horaSalida,
    estado = reservaActual.estado,
    precioTotal = reservaActual.precioTotal,
  } = data;

  await db.query(
    `UPDATE reserva 
     SET idEspacio = ?, nombreCliente = ?, apellidoCliente = ?, placa = ?, telefono = ?, 
         fecha = ?, horaEntrada = ?, horaSalida = ?, estado = ?, precioTotal = ?
     WHERE idReserva = ?`,
    [
      idEspacio,
      nombreCliente,
      apellidoCliente,
      placa,
      telefono,
      fecha,
      horaEntrada,
      horaSalida,
      estado,
      precioTotal,
      id,
    ]
  );

  return await exports.getById(id);
};

// Obtener reserva por id
exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
       r.idReserva, r.codigoReserva, r.idEspacio, r.nombreCliente, r.apellidoCliente, r.placa, r.telefono,
       DATE_FORMAT(r.fecha, '%d/%m/%Y') AS fecha,
       COALESCE(TIME_FORMAT(r.horaEntrada, '%H:%i:%s'), '') AS horaEntrada,
COALESCE(TIME_FORMAT(r.horaSalida, '%H:%i:%s'), '') AS horaSalida,
       r.estado, r.precioTotal,
       e.numeroEspacio
     FROM reserva r
     JOIN espacios e ON r.idEspacio = e.idEspacio
     WHERE r.idReserva=?`,
    [id]
  );
  return rows[0];
};

// Eliminar reserva
exports.remove = async (id) => {
    // Elimina los tickets que están relacionados con la reserva
  await db.query("DELETE FROM tickets WHERE idReserva=?", [id]);

  // Ahora elimina la reserva
  await db.query("DELETE FROM reserva WHERE idReserva=?", [id]);
};

exports.findByUsuario = async (id_usuario) => {
  const [rows] = await db.query(
    `SELECT 
       r.idReserva, r.codigoReserva, r.idEspacio, r.nombreCliente, r.apellidoCliente, r.placa, r.telefono,
       DATE_FORMAT(r.fecha, '%d/%m/%Y') AS fecha,
       COALESCE(TIME_FORMAT(r.horaEntrada, '%H:%i:%s'), '') AS horaEntrada,
       COALESCE(TIME_FORMAT(r.horaSalida, '%H:%i:%s'), '') AS horaSalida,
       r.estado, r.precioTotal,
       e.numeroEspacio
     FROM reserva r
     JOIN espacios e ON r.idEspacio = e.idEspacio
     WHERE r.id_usuario = ?
     ORDER BY r.fecha DESC, r.horaEntrada DESC`,
    [id_usuario]
  );
  return rows;
};

// reservasModel.js


// ✅ Obtener reservas pendientes por usuario
exports.getPendientesPorUsuario = async (id_usuario) => {
  const [rows] = await db.query(`
    SELECT r.*, p.estado AS estadoPago
    FROM reserva r
    JOIN pagos p ON r.idReserva = p.idReserva
    WHERE r.id_usuario = ? AND r.estado = 'activo' AND p.estado = 'pendiente'
    ORDER BY r.idReserva DESC
  `, [id_usuario]);

  return rows;
};

// ✅ Función necesaria para admin y cliente: actualizar solo el estado de la reserva
exports.updateEstado = async (idReserva, nuevoEstado) => {
  await db.query(
    `UPDATE reserva SET estado = ? WHERE idReserva = ?`,
    [nuevoEstado, idReserva]
  );
};


// Sincronizar estado de reserva según estado del pago
exports.sincronizarEstadoReserva = async (idReserva, estadoPago) => {
  let nuevoEstadoReserva;

  switch (estadoPago) {
    case "pendiente":
      nuevoEstadoReserva = "activo";
      break;
    case "pagado":
      nuevoEstadoReserva = "confirmada";
      break;
    case "cancelado":
      nuevoEstadoReserva = "cancelada";
      break;
    default:
      nuevoEstadoReserva = "activo"; // estado seguro por defecto
  }

  await exports.updateEstado(idReserva, nuevoEstadoReserva);
};

exports.getAllActivas = async () => {
  const [rows] = await db.query(`
    SELECT 
      r.idReserva,
      r.codigoReserva,
      r.idEspacio,
      r.nombreCliente,
      r.apellidoCliente,
      r.placa,
      r.telefono,
      DATE_FORMAT(r.fecha, '%d/%m/%Y') AS fecha,
      COALESCE(TIME_FORMAT(r.horaEntrada, '%H:%i:%s'), '') AS horaEntrada,
      COALESCE(TIME_FORMAT(r.horaSalida, '%H:%i:%s'), '') AS horaSalida,
      r.estado,
      r.precioTotal,
      e.numeroEspacio AS numeroEspacio,
      e.estado AS estadoEspacio
    FROM reserva r
    JOIN espacios e ON r.idEspacio = e.idEspacio
    WHERE r.estado IN ('activo', 'proximo')
    ORDER BY r.fecha ASC, r.horaEntrada ASC
  `);

  return rows;
};