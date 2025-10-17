import React, { useEffect, useState } from 'react';
import pagosService from '../../services/pagosService';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import '../../styles/pagos_cl.css';

const MisPagos = () => {
  const { idReserva } = useParams(); // capturar el idReserva si existe
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idReserva) {
      // Modo 1: desde botón "Pagar" con ID específico
      pagosService.getReservasPendientes()
        .then(res => {
          const filtrada = res.data.filter(r => r.idReserva === idReserva);
          setReservas(filtrada);
          setLoading(false);
        })
        .catch(() => {
          Swal.fire('Error', 'No se pudo cargar la reserva', 'error');
          setLoading(false);
        });
    } else {
      // Modo 2: desde el menú, traer todas
      pagosService.getReservasPendientes()
        .then(res => {
          setReservas(res.data);
          setLoading(false);
        })
        .catch(() => {
          Swal.fire('Error', 'No se pudieron cargar las reservas pendientes', 'error');
          setLoading(false);
        });
    }
  }, [idReserva]);

  const handlePago = (idReserva, metodo) => {
    Swal.fire({
      title: 'Procesando pago',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    pagosService.actualizarPago(idReserva, metodo)
      .then(() => {
        Swal.fire('¡Éxito!', 'Pago confirmado correctamente', 'success');
        setReservas(prev => prev.filter(r => r.idReserva !== idReserva));
      })
      .catch(() => {
        Swal.fire('Error', 'No se pudo confirmar el pago', 'error');
      });
  };

  if (loading) return <p>Cargando pagos pendientes...</p>;

  if (reservas.length === 0) return <p>No tienes pagos pendientes.</p>;

  return (
    <div className="mis-pagos-container">
      <h2>Pagos pendientes de tus reservas</h2>
      {reservas.map(reserva => (
        <div key={reserva.idReserva} className="reserva-row" style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>
          <div>
            <strong>Reserva #{reserva.idReserva}</strong>
            <p>Fecha Entrada: {reserva.fecha}</p>
            <p>Hora Entrada: {reserva.horaEntrada}</p>
            <p>Hora Salida: {reserva.horaSalida || '-'}</p>
            <p>Monto: S/. {reserva.precioTotal}</p>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => handlePago(reserva.idReserva, 'tarjeta')}>Pagar con Tarjeta</button>
            <button onClick={() => handlePago(reserva.idReserva, 'yape')}>Pagar con Yape</button>
            <button onClick={() => handlePago(reserva.idReserva, 'qr')}>Pagar con QR</button>
            <button onClick={() => handlePago(reserva.idReserva, 'plin')}>Pagar con Plin</button>
            <button onClick={() => handlePago(reserva.idReserva, 'efectivo')}>Pagar en Efectivo</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MisPagos;
