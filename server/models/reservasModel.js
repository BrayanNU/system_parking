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

  // 🧩 Ajuste: Si la duración es 0 (reserva ilimitada)
  let horaSalidaFinal = data.horaSalida;
  let precioTotalFinal = data.precioTotal;
  let estadoFinal = data.estado || "activo";

  if (data.duracionHoras === 0 || Number(data.duracionHoras) === 0) {
    horaSalidaFinal = "00:00:00";
    precioTotalFinal = "0.00";
    estadoFinal = "Ilimitado";
  }

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
      horaSalidaFinal,
      data.codigoReserva,
      estadoFinal,
      precioTotalFinal,
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
    horaEntrada = reservaActual.horaEntrada,
    horaSalida = reservaActual.horaSalida,
    estado = reservaActual.estado,
    precioTotal = reservaActual.precioTotal,
  } = data;

  // 🧠 Asegurar formato correcto de fecha (YYYY-MM-DD)
  let fechaFinal = data.fecha || reservaActual.fecha;
  if (fechaFinal && fechaFinal.includes('/')) {
    const [dia, mes, anio] = fechaFinal.split('/');
    fechaFinal = `${anio}-${mes}-${dia}`;
  }

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
      fechaFinal,
      horaEntrada,
      horaSalida,
      estado,
      precioTotal,
      id,
    ]
  );

  // 🔁 Devolvemos la reserva actualizada con formato consistente
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

// ✅ Obtener reservas pendientes por usuario
exports.getPendientesPorUsuario = async (id_usuario) => {
  const [rows] = await db.query(`
    SELECT 
    r.*, 
    COALESCE(p.estado, 'sin_pago') AS estadoPago
FROM 
    reserva r
LEFT JOIN 
    pagos p ON r.idReserva = p.idReserva
WHERE 
    r.id_usuario = ?
    AND r.estado IN ('activo', 'pendiente', 'cancelada', 'finalizada', 'Ilimitado')
    AND (p.estado = 'pendiente' OR p.estado IS NULL)
ORDER BY 
    r.idReserva DESC

  `, [id_usuario]);

  return rows;
};

// ✅ Actualizar solo el estado de la reserva
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
      r.id_usuario,
      r.nombreCliente,
      r.apellidoCliente,
      r.placa,
      r.telefono,
      DATE_FORMAT(r.fecha, '%d/%m/%Y') AS fecha,
      COALESCE(TIME_FORMAT(r.horaEntrada, '%H:%i:%s'), '') AS horaEntrada,
      COALESCE(TIME_FORMAT(r.horaSalida, '%H:%i:%s'), '') AS horaSalida,
      r.estado,
      r.precioTotal,
      r.avisoProximo,
      r.avisoInicio,
      r.avisoCasiTermina,
      e.numeroEspacio AS numeroEspacio,
      e.estado AS estadoEspacio
    FROM reserva r
    JOIN espacios e ON r.idEspacio = e.idEspacio
    WHERE r.estado IN ('activo', 'proximo', 'pendiente')
    ORDER BY r.fecha ASC, r.horaEntrada ASC
  `);

  return rows;
};


// 🔄 Actualización automática (usada por el cron job)
exports.updateAuto = async (idReserva, datos) => {
  if (!idReserva || !datos || Object.keys(datos).length === 0) return false;

  const campos = Object.keys(datos)
    .map((campo) => `${campo} = ?`)
    .join(", ");
  const valores = Object.values(datos);

  const [result] = await db.query(
    `UPDATE reserva SET ${campos} WHERE idReserva = ?`,
    [...valores, idReserva]
  );

  return result.affectedRows > 0;
};
