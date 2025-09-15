// src/components/layout/Sidebar.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/reservas">Reservas</Link>
        </li>
        <li>
          <Link to="/espacios">Espacios</Link>
        </li>
        <li>
          <Link to="/pagos">Pagos</Link>
        </li>
        <li>
          <Link to="/notificaciones">Notificaciones</Link>
        </li>
        <li>
          <Link to="/usuarios">Usuarios</Link>
        </li>
      </ul>

      {/* Botón de cerrar sesión */}
      <button
        onClick={logout}
        style={{
          marginTop: "20px",
          padding: "10px",
          width: "100%",
          cursor: "pointer",
          background: "crimson",
          color: "white",
          border: "none",
          borderRadius: "5px"
        }}
      >
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;
