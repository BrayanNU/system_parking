import React, { useEffect, useState } from "react";
import espaciosService from "../../services/espaciosService";
import "../../styles/espacios.css";
import { useNavigate } from "react-router-dom";

const EspaciosList = () => {
  const [espacios, setEspacios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEspacios() {
      try {
        const res = await espaciosService.getAll();
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

  return (
    <div className="esp-container-espacios">
      <h2 className="esp-h2">Gestión de Espacios</h2>
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
      <div className="esp-plano">
        {espacios.map((esp) => (
          <div
            key={esp.idEspacio}
            id={`esp-${esp.idEspacio}`}
            className={`esp-box ${getEstadoClase(esp.numeroEspacio)}`}
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate("/dashboard/reservas", { state: { idEspacio: esp.idEspacio } })
            }
          >
            {esp.numeroEspacio}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EspaciosList;
