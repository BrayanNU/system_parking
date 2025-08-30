// src/components/ReservaList.js
import '../App.css'; 
// src/components/ReservaList.js
import React, { useState, useEffect } from 'react';

const ReservaList = () => {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/reservas')
      .then((response) => response.json())
      .then((data) => setReservas(data))
      .catch((error) => console.error('Error al obtener las reservas:', error));
  }, []);

  return (
    <div>
      <h2>Lista de Reservas</h2>
      <ul>
        {reservas.map((reserva) => (
          <li key={reserva.id}>
            Placa: {reserva.placa} | Fecha: {reserva.fecha} | Entrada: {reserva.horaEntrada} | Salida: {reserva.horaSalida}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReservaList;
