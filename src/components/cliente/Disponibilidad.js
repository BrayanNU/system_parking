import React, { useEffect, useState } from "react";
import espaciosService from "../../services/espaciosService";
import "../../styles/espacios.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Disponibilidad = () => {
  const [espacios, setEspacios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  async function fetchEspacios() {
    try {
      const res = await espaciosService.getPublicos(); // 👈 ahora sí cliente
      console.log("📌 Espacios obtenidos (cliente):", res.data);
      setEspacios(res.data);
    } catch (error) {
      console.error("Error al obtener los espacios:", error);
    }
  }
  fetchEspacios();
}, []);



  // Función para obtener la clase de color según el estado
  const getEstadoClase = (numeroEspacio) => {
    const espacio = espacios.find((e) => e.numeroEspacio === numeroEspacio);
    if (!espacio) return "";
    switch (espacio.estado) {
      case "disponible":
        return "esp-disponible";
      case "ocupado":
        return "esp-ocupado";
      case "proximo":
        return "esp-reservado";
      case "inactivo":
        return "esp-inactivo";
      default:
        return "";
    }
  };

  // Click en un espacio
  const handleClickEspacio = (espacio) => {
    if (espacio.estado === "disponible") {
      navigate("/cliente/reservas", { state: { idEspacio: espacio.idEspacio } });
    } else {
      Swal.fire({
        icon: "error",
        title: "Espacio no disponible",
        text: `El espacio ${espacio.numeroEspacio} está ${espacio.estado}.`,
        confirmButtonColor: "#ff5a00",
      });
    }
  };

  return (
    <div className="esp-container-espacios">
      <h2 className="esp-h2">Disponibilidad de Espacios</h2>

      {/* Leyenda */}
      <div className="esp-encabezado">
        <div className="esp-icon">
          <div className="esp-circ-1"></div>
          <p className="textoEspa">Disponible</p>
        </div>
        <div className="esp-icon">
          <div className="esp-circ-2"></div>
          <p className="textoEspa">Ocupado</p>
        </div>
        <div className="esp-icon">
          <div className="esp-circ-3"></div>
          <p className="textoEspa">Próximo</p>
        </div>
      </div>

      {/* Plano de espacios */}
      <div className="esp-plano">
        {espacios.map((esp) => (
          <div
            key={esp.idEspacio}
            id={`esp-${esp.idEspacio}`}
            className={`esp-box ${getEstadoClase(esp.numeroEspacio)}`}
            style={{ cursor: "pointer" }}
            onClick={() => handleClickEspacio(esp)}
          >
            {esp.numeroEspacio}
          </div>
        ))}
      </div>
      <div className="info_res">
  <h2 className="info-title">Instrucciones para seleccionar un espacio de estacionamiento</h2>
  <ul className="info-bullets">
    <li>
      <strong>Visualiza el mapa de espacios disponibles.</strong><br />
      Cada espacio se muestra con un color que indica su estado actual.
    </li>
    <li>
      <strong>Significado de los colores:</strong>
      <ul className="color-legend">
  <li><div className="esp-circ-a"></div>Espacio disponible. Puedes seleccionarlo para realizar una reserva.</li>
  <li><div className="esp-circ-b"></div>Espacio ocupado o no disponible. No se puede seleccionar.</li>
  <li><div className="esp-circ-c"></div>Espacio reservado próximamente (se ocupará en menos de 10 minutos).</li>
</ul>
    </li>
    <li>
      <strong>Selecciona un espacio verde.</strong><br />
      Haz clic sobre el espacio que desees reservar.
    </li>
    <li>
      <strong>Registra la hora de tu reserva.</strong><br />
      Indica la hora de inicio y fin para confirmar tu reserva.
    </li>
    <li>
      <strong>Verificación de disponibilidad por horario.</strong><br />
      Si el sistema detecta que tu horario se cruza con otra reserva, se mostrará un aviso indicando que no es posible registrar la reserva en ese horario.
    </li>
    <li>
      <strong>Confirmación de reserva.</strong><br />
      Una vez validada la disponibilidad, podrás completar el registro exitosamente.
    </li>
  </ul>
</div>

    </div>
  );
};

export default Disponibilidad;
