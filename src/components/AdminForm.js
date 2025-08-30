// src/components/AdminForm.js
import React, { useState } from 'react';

const AdminForm = () => {
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [fecha, setFecha] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevaReserva = { placa, tipo, horaEntrada, horaSalida, fecha };

    // Hacemos una solicitud POST al backend
    fetch('http://localhost:5000/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaReserva),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Reserva registrada:', data);
        // Aquí podrías actualizar el estado o mostrar un mensaje
      })
      .catch((error) => console.error('Error al registrar la reserva:', error));
  };

  return (
    <div>
      <h2>Registrar Solicitud de Estacionamiento</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Placa del Vehículo:
          <input
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Tipo de Vehículo:
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Hora de Entrada:
          <input
            type="time"
            value={horaEntrada}
            onChange={(e) => setHoraEntrada(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Hora de Salida:
          <input
            type="time"
            value={horaSalida}
            onChange={(e) => setHoraSalida(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Fecha:
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Registrar Solicitud</button>
      </form>
    </div>
  );
};

export default AdminForm;
