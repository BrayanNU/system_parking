// src/components/cliente/ClienteSidebar.js
import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/sidebarCliente.css";

const ClienteSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
const { logout } = useContext(AuthContext);

  const toggleMenu = () => setOpen(!open);

  return (
    <>
      {/* Botón hamburguesa arriba (solo móvil) */}
      <div className="cliente-navbar">
        <button className="menu-btn" onClick={toggleMenu}>
          ☰
        </button>
        <h1 className="logo">PlazaPark</h1>
      </div>

      {/* Sidebar deslizante */}
      <div className={`cliente-sidebar ${open ? "open" : ""}`}>
        <nav>
          <ul>
            <li className={location.pathname.includes("/cliente/disponibilidad") ? "active" : ""}>
              <Link to="/cliente/disponibilidad" onClick={toggleMenu}>
                Disponibilidad
              </Link>
            </li>
            <li className={location.pathname.includes("/cliente/reservas") ? "active" : ""}>
              <Link to="/cliente/reservas" onClick={toggleMenu}>
                Mis Reservas
              </Link>
            </li>
            <li className={location.pathname.includes("/cliente/pagos") ? "active" : ""}>
              <Link to="/cliente/pagos" onClick={toggleMenu}>
                Pagos
              </Link>
            </li>
          </ul>
        </nav>
        <button 
          onClick={() => {
            toggleMenu();
            logout();
          }}
          className="logout-button-cl"
        >
          Cerrar sesión
        </button>

      </div>
    </>
  );
};

export default ClienteSidebar;
