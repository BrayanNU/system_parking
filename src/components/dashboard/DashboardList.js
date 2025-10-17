// src/components/dashboard/DashboardList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "../../styles/Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardList = () => {
  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setData(res.data.data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("Error al obtener datos del dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  if (loading) return <p className="text-center mt-5">Cargando datos...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;
  if (!data) return <p className="text-center mt-5">No hay datos disponibles</p>;

  const {
    reservasHoy,
    pagosHoy,
    espaciosDisponibles,
    espaciosOcupados,
    espaciosProximos,
    usuariosActivos,
    ocupacionActual,
    ultimasReservas,
    ingresosSemanales,
    listaEspacios,
  } = data;

  // 🟢 Gráfico circular: ocupación actual
  const pieData = {
    labels: ["Ocupados", "Disponibles"],
    datasets: [
      {
        data: [ocupacionActual, 100 - ocupacionActual],
        backgroundColor: ["#6788f5ff", "#2356e4ff"],
        hoverOffset: 8,
      },
    ],
  };

  // 🔵 Gráfico de barras: ingresos semanales (dinámico)
  const diasSemana = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
  ];

  // Convertir los datos del backend en un mapa { dia: monto }
  const ingresosMap = {};
  if (ingresosSemanales && Array.isArray(ingresosSemanales)) {
    ingresosSemanales.forEach((item) => {
      ingresosMap[item.dia.toLowerCase()] = item.monto;
    });
  }

  // Crear arreglo final (0 si no hay datos para ese día)
  const ingresosFinal = diasSemana.map((dia) => ingresosMap[dia] || 0);

  const barData = {
    labels: diasSemana.map(
      (d) => d.charAt(0).toUpperCase() + d.slice(1)
    ),
    datasets: [
      {
        label: "Ingresos (S/)",
        data: ingresosFinal,
        backgroundColor: "#0841C5",
      },
    ],
  };

  return (
    <div className="contenedor_dash">
      {/* Tarjetas superiores */}
      <div className="encabe">
        <div className="dad_1">
          <div className="col-md-3">
            <div className="tarjetas_1">
              <div className="card-body">
                <h5>Reservas activas hoy</h5>
                <h3 style={{ color: "#555" }}>{reservasHoy}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="tarjetas_1">
              <div className="card-body">
                <h5>Pagos del día (S/)</h5>
                <h3 style={{ color: "#555" }}>{pagosHoy}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="tarjetas_1">
              <div className="card-body">
                <h5>Usuarios activos</h5>
                <h3 style={{ color: "#555" }}>{usuariosActivos}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="tarjetas_1">
              <div className="card-body">
                <h5>Ocupación actual (%)</h5>
                <h3 style={{ color: "#555" }}>{ocupacionActual}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Espacios (dividido en 3) */}
        <div className="dad_2">
          <div className="col-md-4">
            <div className="tarjetas_2">
              <div className="card-body">
                <h6>Espacios disponibles</h6>
                <h4>{espaciosDisponibles}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="tarjetas_2">
              <div className="card-body">
                <h6>Espacios ocupados</h6>
                <h4>{espaciosOcupados}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="tarjetas_2">
              <div className="card-body">
                <h6>Próximos a ocupar</h6>
                <h4>{espaciosProximos}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="tap">
        <div className="tapito_1">
          <h5>Ingresos semanales</h5>
          <div style={{ width: "1000px", height: "225px" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="tapito_2">
          <h5>Ocupación actual</h5>
          <div style={{ width: "100%", height: "220px" }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Listado de espacios */}
      <div className="final">
        {/* Reservas recientes */}
        <div className="final_1">
          <h4>Últimas Reservas</h4>
          <table className="table table-striped table-hover mt-3">
            <thead className="table-primary">
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Placa</th>
                <th>Espacio</th>
                <th>Fecha</th>
                <th>Hora entrada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ultimasReservas && ultimasReservas.length > 0 ? (
                ultimasReservas.slice(0, 8).map((r, i) => (
                  <tr key={i}>
                    <td>{r.codigoReserva}</td>
                    <td>{r.nombreCliente}</td>
                    <td>{r.placa}</td>
                    <td>{r.numeroEspacio}</td>
                    <td>{new Date(r.fecha).toLocaleDateString()}</td>
                    <td>{r.horaEntrada}</td>
                    <td>{r.estado}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No hay reservas recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="final_2">
          <h4>Estado actual de espacios</h4>
          <div className="d-flex flex-wrap gap-3 mt-3">
            {listaEspacios && listaEspacios.length > 0 ? (
              listaEspacios.map((e, i) => (
                <div
                  key={i}
                  className={`div_es ${
                    e.estado === "ocupado"
                      ? "ocupado"
                      : e.estado === "reservado"
                      ? "proximo"
                      : "disponible"
                  }`}
                  style={{
                    width: "60px",
                    borderRadius: "5px",
                    padding: "3px",
                    fontSize: "9px",
                  }}
                >
                  <strong>{e.numero}</strong>
                  <p className="m-0">{e.estado}</p>
                </div>
              ))
            ) : (
              <p>No hay espacios registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardList;
