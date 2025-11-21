// src/components/dashboard/ModalEditReserva.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import "../../styles/reserva.css";

const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return dateStr;
};

const timeHHMMSS = (d = new Date()) => d.toTimeString().slice(0, 8);

const addHoursToTime = (timeStrHHMMSS, hoursToAdd) => {
  const [hh, mm, ss] = timeStrHHMMSS.split(":").map(Number);
  const base = new Date();
  base.setHours(hh, mm, ss, 0);
  const result = new Date(base.getTime() + hoursToAdd * 60 * 60 * 1000);
  return result.toTimeString().slice(0, 8);
};

const ModalEditReserva = ({ reserva, onClose, onSave, espacios, tarifas }) => {
  const [formData, setFormData] = useState({});

  // Selecciona la tarifa por hora activa
  const tarifaHora = useMemo(() => {
    if (!tarifas) return null;
    return (
      tarifas.find(
        (t) => t.activa && (t.unidad === "hora" || t.dTarifa?.toLowerCase().includes("hora"))
      ) || tarifas[0] || null
    );
  }, [tarifas]);

  const calcularSalidaYPrecio = useCallback(
    (dur) => {
      const durNum = Number(dur) || 0;
      const horaEntrada = formData.horaEntrada || timeHHMMSS();
      const horaSalida = addHoursToTime(horaEntrada, durNum);
      const precioTotal = tarifaHora ? (Number(tarifaHora.precio) * durNum).toFixed(2) : "";
      return { horaSalida, precioTotal };
    },
    [formData.horaEntrada, tarifaHora]
  );

  // 🧠 Nueva función para calcular duración basado en horaEntrada y horaSalida
  const calcularDuracionDesdeHoras = (horaEntrada, horaSalida) => {
    const [hEntrada, mEntrada] = horaEntrada.split(":").map(Number);
    const [hSalida, mSalida] = horaSalida.split(":").map(Number);

    const entrada = new Date();
    entrada.setHours(hEntrada, mEntrada, 0, 0);

    const salida = new Date();
    salida.setHours(hSalida, mSalida, 0, 0);

    const diff = (salida - entrada) / (1000 * 60 * 60); // En horas
    return diff > 0 ? diff : 0; // Para evitar valores negativos
  };

  useEffect(() => {
    if (!reserva) return;

    let horaSalida = reserva.horaSalida;
    let precioTotal = reserva.precioTotal;

    if (!horaSalida && reserva.duracionHoras) {
      const calc = calcularSalidaYPrecio(reserva.duracionHoras);
      horaSalida = calc.horaSalida;
      precioTotal = calc.precioTotal;
    }

    setFormData({
      idEspacio: reserva.idEspacio,
      nombreCliente: reserva.nombreCliente || "",
      apellidoCliente: reserva.apellidoCliente || "",
      placa: reserva.placa || "",
      telefono: reserva.telefono || "",
      fecha: reserva.fecha ? formatDateForInput(reserva.fecha) : new Date().toISOString().split("T")[0],
      horaEntrada: reserva.horaEntrada || timeHHMMSS(),
      horaSalida,
      estado: reserva.estado || "activo",
      precioTotal,
      duracionHoras: reserva.duracionHoras || "",
    });
  }, [reserva, calcularSalidaYPrecio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 🕒 Si la hora de salida cambia, calculamos la nueva duración y el monto
    if (name === "horaSalida") {
      const duracion = calcularDuracionDesdeHoras(formData.horaEntrada, value);
      const { horaSalida, precioTotal } = calcularSalidaYPrecio(duracion);
      setFormData((prev) => ({
        ...prev,
        horaSalida,
        duracionHoras: duracion.toFixed(2),
        precioTotal,
      }));
      return;
    }

    // 🕐 Si la duración cambia, recalculamos la hora de salida y el monto
    if (name === "duracionHoras") {
      const { horaSalida, precioTotal } = calcularSalidaYPrecio(value);
      setFormData((prev) => ({ ...prev, duracionHoras: value, horaSalida, precioTotal }));
      return;
    }

    // Caso estándar, actualizamos el campo
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      duracionHoras: Number(formData.duracionHoras),
      fecha: formData.fecha,
    });
  };

  const modalRoot = document.getElementById("modal-root");

  return ReactDOM.createPortal(
    <div className="modal-background">
      <div className="modal-content">
        <h2>Editar Reserva</h2>
        <form onSubmit={handleSubmit}>
          <select name="idEspacio" value={formData.idEspacio} onChange={handleChange}>
            <option value="">-- Seleccionar espacio --</option>
            {espacios.map((esp) => (
              <option key={esp.idEspacio} value={esp.idEspacio}>
                {esp.numeroEspacio} {esp.estado === "ocupado" ? "(ocupado)" : ""}
              </option>
            ))}
          </select>

          <input type="text" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} placeholder="Nombre" />
          <input type="text" name="apellidoCliente" value={formData.apellidoCliente} onChange={handleChange} placeholder="Apellido" />
          <input type="text" name="placa" value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })} placeholder="Placa" />
          <input type="tel" name="telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, "") })} placeholder="Teléfono" />

          <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
          <input type="time" name="horaEntrada" value={formData.horaEntrada?.slice(0, 5)} onChange={handleChange} />
          <input type="time" name="horaSalida" value={formData.horaSalida?.slice(0, 5)} onChange={handleChange} />

          <select name="estado" value={formData.estado} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
            <option value="finalizada">Finalizada</option>
          </select>

          <input type="number" name="duracionHoras" value={formData.duracionHoras} onChange={handleChange} placeholder="Duración (h)" min="0.1" step="0.01" />
          <input type="number" name="precioTotal" value={formData.precioTotal} onChange={handleChange} placeholder="Precio Total" min="0" step="0.01" />

          <div style={{ marginTop: 10 }}>
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
          </div>
        </form>
        {tarifaHora && <p>Tarifa aplicada: S/ {tarifaHora.precio} ({tarifaHora.descripcion})</p>}
      </div>
    </div>,
    modalRoot
  );
};

export default ModalEditReserva;

