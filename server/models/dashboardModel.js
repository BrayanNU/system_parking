// server/models/dashboardModel.js
const pool = require("../config/db");

exports.getDashboardData = async () => {
  try {
    // ✅ Reservas activas hoy
    const [reservasHoy] = await pool.query(`
      SELECT COUNT(*) AS total 
      FROM reserva 
      WHERE DATE(fecha) = CURDATE() AND estado = 'activo'
    `);

    // ✅ Pagos del día (suma total)
    const [pagosHoy] = await pool.query(`
      SELECT IFNULL(SUM(monto), 0) AS total
      FROM pagos 
      WHERE DATE(fechaPago) = CURDATE()
    `);

    // ✅ Espacios (disponibles, ocupados, próximos)
    const [espaciosDisponibles] = await pool.query(`
      SELECT COUNT(*) AS total FROM espacios WHERE estado = 'disponible'
    `);
    const [espaciosOcupados] = await pool.query(`
      SELECT COUNT(*) AS total FROM espacios WHERE estado = 'ocupado'
    `);
    const [espaciosProximos] = await pool.query(`
      SELECT COUNT(*) AS total FROM espacios WHERE estado = 'reservado'
    `);

    // ✅ Usuarios activos
    const [usuariosActivos] = await pool.query(`
      SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'activo'
    `);

    // ✅ Ocupación actual (%)
    const totalEspacios =
      espaciosDisponibles[0].total +
      espaciosOcupados[0].total +
      espaciosProximos[0].total;

    const ocupacionActual = totalEspacios
      ? Math.round((espaciosOcupados[0].total / totalEspacios) * 100)
      : 0;

    // ✅ Últimas reservas (limite 8)
    const [ultimasReservas] = await pool.query(`
      SELECT 
        r.codigoReserva,
        u.nombre,
        r.placa,
        e.numeroEspacio,
        r.fecha AS fecha,
        r.horaEntrada,
        r.estado
      FROM reserva r
      LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
      JOIN espacios e ON r.idEspacio = e.idEspacio
      ORDER BY r.fecha DESC
      LIMIT 6
    `);

    // ✅ Lista de espacios con su estado
    const [listaEspacios] = await pool.query(`
      SELECT idEspacio, numeroEspacio AS numero, estado 
      FROM espacios 
      ORDER BY numeroEspacio ASC
    `);

    // ✅ Ingresos semanales (últimas 4 semanas)
await pool.query("SET lc_time_names = 'es_ES'");

    const [ingresosSemanales] = await pool.query(`
      SELECT 
        DAYNAME(fechaPago) AS dia,
        SUM(monto) AS monto
      FROM pagos
      WHERE YEARWEEK(fechaPago, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY DAYOFWEEK(fechaPago)
      ORDER BY DAYOFWEEK(fechaPago)
    `);

    // Retornar todo formateado
    return {
      reservasHoy: reservasHoy[0].total,
      pagosHoy: pagosHoy[0].total,
      espaciosDisponibles: espaciosDisponibles[0].total,
      espaciosOcupados: espaciosOcupados[0].total,
      espaciosProximos: espaciosProximos[0].total,
      usuariosActivos: usuariosActivos[0].total,
      ocupacionActual,
      ultimasReservas,
      listaEspacios,
      ingresosSemanales,
    };
  } catch (err) {
    console.error("❌ Error en dashboardModel:", err);
    throw err;
  }
};
