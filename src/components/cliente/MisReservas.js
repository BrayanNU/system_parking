
// src/components/cliente/MisReservas.js
import React, { useState, useEffect } from "react";
import reservasService from "../../services/reservasService";
import espaciosService from "../../services/espaciosService";
import tarifasService from "../../services/tarifasService";
import { QRCodeCanvas } from "qrcode.react";
import Swal from "sweetalert2";
import "../../styles/misReservas.css";
import { useNavigate, useLocation } from "react-router-dom";


const MisReservas = () => {
  
  const location = useLocation();
  const { idEspacio } = location.state || {}; 
  const navigate = useNavigate();

  const [reservas, setReservas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  
  const [form, setForm] = useState({
    idEspacio: idEspacio || "",
    placa: "",
    telefono: "",
    fecha: "",
    horaEntrada: "",
    duracionHoras: 1,
  });

  // Cargar datos iniciales
 useEffect(() => {
  fetchReservas();
  fetchEspacios();
  fetchTarifas();
}, []);

   useEffect(() => {
    if (idEspacio) {
      setForm((prev) => ({ ...prev, idEspacio }));
    }
  }, [idEspacio]);
  
  const fetchReservas = async () => {
    try {
      const res = await reservasService.getByUsuario();
      setReservas(res.data || []);
    } catch (err) {
      console.error("Error al cargar reservas:", err);
      Swal.fire("Error", "No se pudieron cargar tus reservas", "error");
    }
  };

 const fetchEspacios = async () => {
  try {
    const res = await espaciosService.getLibresCliente(); // ✅
    setEspacios(res.data || []);
  } catch (err) {
    console.error("Error al cargar espacios:", err);
  }
};

const fetchTarifas = async () => {
  try {
    const res = await tarifasService.getActivaCl(); // ✅
    setTarifas(res.data || []);
  } catch (err) {
    console.error("Error al cargar tarifas:", err);
  }
};

  // Manejo del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reservasService.createCliente(form);
      Swal.fire("Éxito", "Reserva creada correctamente", "success");
      fetchReservas();
      fetchEspacios();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "No se pudo crear la reserva", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (confirm.isConfirmed) {
      try {
        await reservasService.remove(id);
        Swal.fire("Eliminada", "La reserva fue eliminada", "success");

        fetchReservas();
      } catch (err) {
        Swal.fire("Error", "No se pudo eliminar la reserva", "error");
        console.log("este el id del id reserva", id);
      }
    }
    
  };

  return (
    
    <div className="mis-reservas">
      <h2>Mis Reservas</h2>

      {/* Formulario de reserva */}
      <form className="reserva-form" onSubmit={handleSubmit}>
        <div>
          <label>Espacio</label>
          <select
            name="idEspacio"
            className="form-control"
            value={form.idEspacio}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            {espacios.map((e) => (
              <option key={e.idEspacio} value={e.idEspacio}>
                Espacio {e.numeroEspacio}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Placa</label>
          <input
            type="text"
            name="placa"
            className="form-control"
            value={form.placa}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            className="form-control"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Fecha</label>
          <input
            type="date"
            name="fecha"
            className="form-control"
            value={form.fecha}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Hora Entrada</label>
          <input
            type="time"
            name="horaEntrada"
            className="form-control"
            value={form.horaEntrada}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Duración (horas)</label>
          <input
            type="number"
            name="duracionHoras"
            className="form-control"
            value={form.duracionHoras}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div>
          <label>Precio estimado</label>
          <input
            type="text"
            className="form-control"
            value={
              tarifas.length > 0
                ? `S/ ${
                    (tarifas[0].montoHora || 0) * (form.duracionHoras || 1)
                  }`
                : "N/A"
            }
            disabled
          />
        </div>

        <button type="submit" className="btn-submit">
          Crear Reserva
        </button>
      </form>

      {/* Tabla de reservas */}
      <div className="tabla-reservas">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Código</th>
              <th>Espacio</th>
              <th>Placa</th>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>QR</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length > 0 ? (
              reservas.map((r) => (
                <tr key={r.idReserva}>
                  <td>{r.codigoReserva}</td>
                  <td>{r.numeroEspacio || r.idEspacio}</td>
                  <td>{r.placa}</td>
                  <td>{r.fecha}</td>
                  <td>{r.horaEntrada}</td>
                  <td>{r.horaSalida}</td>
                  <td>S/ {r.precioTotal}</td>
                  <td>{r.estado}</td>
                  <td>
                    <QRCodeCanvas value={r.codigoReserva} size={64} />
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(r.idReserva)}
                    >
                      Eliminar
                    </button>
                      <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/cliente/pagos/${r.idReserva}`)} // <-- Navigate to the payment page
                    >
                      Pagar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  No tienes reservas aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MisReservas;
