// src/components/dashboard/ReservaList.js
import React, { useState, useEffect } from "react";
import reservasService from "../../services/reservasService";
import espaciosService from "../../services/espaciosService";

const ReservaList = () => {
  const [reservas, setReservas] = useState([]);
  const [espaciosLibres, setEspaciosLibres] = useState([]);
  const [formData, setFormData] = useState({
    idEspacio: "",
    nombreCliente: "",
    apellidoCliente: "",
    placa: "",
    tipo: "",
    fecha: "",
    duracionHoras: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchReservas();
    fetchEspaciosLibres();
  }, []);

  const fetchReservas = async () => {
    try {
      const res = await reservasService.getAll();
      setReservas(res.data);
    } catch (error) {
      console.error("Error cargando reservas:", error);
    }
  };

  const fetchEspaciosLibres = async () => {
    try {
      const res = await espaciosService.getLibres();
      setEspaciosLibres(res.data);
    } catch (error) {
      console.error("Error cargando espacios libres:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await reservasService.update(editId, formData);
        setEditId(null);
      } else {
        await reservasService.create(formData);
      }
      fetchReservas();
      fetchEspaciosLibres(); // actualizar espacios disponibles
      setFormData({
        idEspacio: "",
        nombreCliente: "",
        apellidoCliente: "",
        placa: "",
        tipo: "",
        fecha: "",
        duracionHoras: "",
      });
    } catch (error) {
      console.error("Error al guardar reserva:", error);
    }
  };

  const handleEdit = (reserva) => {
    setFormData({
      idEspacio: reserva.idEspacio,
      nombreCliente: reserva.nombreCliente,
      apellidoCliente: reserva.apellidoCliente,
      placa: reserva.placa,
      tipo: reserva.tipo,
      fecha: reserva.fecha,
      duracionHoras: "", // no editamos horaEntrada ni horaSalida directamente
    });
    setEditId(reserva.idReserva);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta reserva?")) {
      try {
        await reservasService.remove(id);
        fetchReservas();
        fetchEspaciosLibres();
      } catch (error) {
        console.error("Error eliminando reserva:", error);
      }
    }
  };

  const handlePrint = (reserva) => {
    const printWindow = window.open("", "", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Reserva</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            .ticket { border: 1px dashed #000; padding: 10px; margin-top: 20px; }
            .info { margin: 5px 0; }
            .barcode { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>🎟️ Ticket de Reserva</h2>
          <div class="ticket">
            <div class="info"><strong>Código Reserva:</strong> ${reserva.codigoReserva}</div>
            <div class="info"><strong>Cliente:</strong> ${reserva.nombreCliente} ${reserva.apellidoCliente}</div>
            <div class="info"><strong>Placa:</strong> ${reserva.placa}</div>
            <div class="info"><strong>Tipo:</strong> ${reserva.tipo}</div>
            <div class="info"><strong>Fecha:</strong> ${reserva.fecha}</div>
            <div class="info"><strong>Hora Entrada:</strong> ${reserva.horaEntrada}</div>
            <div class="info"><strong>Hora Salida:</strong> ${reserva.horaSalida}</div>
            <div class="info"><strong>Precio Total:</strong> S/. ${reserva.precioTotal}</div>
            <div class="info"><strong>Estado:</strong> ${reserva.estado}</div>
            <div class="barcode">
              <img src="https://barcodeapi.org/api/128/${reserva.codigoReserva}" />
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Formulario */}
      <div style={{ flex: "1" }}>
        <h2>{editId ? "Editar Reserva" : "Registrar Reserva"}</h2>
        <form onSubmit={handleSubmit}>
          <select
            name="idEspacio"
            value={formData.idEspacio}
            onChange={handleChange}
            required
          >
            <option value="">-- Seleccionar espacio --</option>
            {espaciosLibres.map((e) => (
              <option key={e.idEspacio} value={e.idEspacio}>
                Espacio #{e.numeroEspacio} ({e.estado})
              </option>
            ))}
          </select>
          <input
            type="text"
            name="nombreCliente"
            placeholder="Nombre Cliente"
            value={formData.nombreCliente}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="apellidoCliente"
            placeholder="Apellido Cliente"
            value={formData.apellidoCliente}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="placa"
            placeholder="Placa"
            value={formData.placa}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="tipo"
            placeholder="Tipo de vehículo"
            value={formData.tipo}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
          <select
            name="duracionHoras"
            value={formData.duracionHoras}
            onChange={handleChange}
            required
          >
            <option value="">-- Seleccionar duración --</option>
            <option value="1">1 hora</option>
            <option value="2">2 horas</option>
            <option value="3">3 horas</option>
          </select>
          <button type="submit">
            {editId ? "Guardar Cambios" : "Agregar Reserva"}
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div style={{ flex: "2" }}>
        <h2>Lista de Reservas</h2>
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Espacio</th>
              <th>Cliente</th>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Precio Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.idReserva}>
                <td>{reserva.idReserva}</td>
                <td>{reserva.codigoReserva}</td>
                <td>{reserva.idEspacio}</td>
                <td>
                  {reserva.nombreCliente} {reserva.apellidoCliente}
                </td>
                <td>{reserva.placa}</td>
                <td>{reserva.tipo}</td>
                <td>{reserva.fecha}</td>
                <td>{reserva.horaEntrada}</td>
                <td>{reserva.horaSalida}</td>
                <td>{reserva.precioTotal}</td>
                <td>{reserva.estado}</td>
                <td>
                  <button onClick={() => handleEdit(reserva)}>Editar</button>
                  <button onClick={() => handleDelete(reserva.idReserva)}>
                    Eliminar
                  </button>
                  <button onClick={() => handlePrint(reserva)}>
                    Imprimir Ticket
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservaList;
