const enviarCorreoReserva = require("./mailer"); // tu función base de envío

exports.enviarCorreoInicio = async (reserva, correo) => {
  await enviarCorreoReserva({
    correo,
    nombre: reserva.nombreCliente,
    apellido: reserva.apellidoCliente,
    codigo: reserva.codigoReserva,
    espacio: reserva.numeroEspacio,
    horaEntrada: reserva.horaEntrada,
    horaSalida: reserva.horaSalida,
    monto: reserva.precioTotal,
    fecha: reserva.fecha,
    tipo: "inicio", // puedes usar esto en el template
  });
};

exports.enviarCorreoProximo = async (reserva, correo) => {
  await enviarCorreoReserva({
    correo,
    nombre: reserva.nombreCliente,
    apellido: reserva.apellidoCliente,
    codigo: reserva.codigoReserva,
    espacio: reserva.numeroEspacio,
    horaEntrada: reserva.horaEntrada,
    horaSalida: reserva.horaSalida,
    monto: reserva.precioTotal,
    fecha: reserva.fecha,
    tipo: "proximo",
  });
};

exports.enviarCorreoCasiTermina = async (reserva, correo) => {
  await enviarCorreoReserva({
    correo,
    nombre: reserva.nombreCliente,
    apellido: reserva.apellidoCliente,
    codigo: reserva.codigoReserva,
    espacio: reserva.numeroEspacio,
    horaEntrada: reserva.horaEntrada,
    horaSalida: reserva.horaSalida,
    monto: reserva.precioTotal,
    fecha: reserva.fecha,
    tipo: "casiTermina",
  });
};
