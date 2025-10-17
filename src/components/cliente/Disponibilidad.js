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
        <div className="esp-icon">
          <div className="esp-circ-4"></div>
          <p className="textoEspa">Inactivo</p>
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
    </div>
  );
};

export default Disponibilidad;
