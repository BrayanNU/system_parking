// src/components/layout/Sidebar.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/sidebar.css";

// Importar íconos de Lucide
import {
  LayoutDashboard,
  Calendar,
  Building,
  CreditCard,
  //Bell,
  UserCog,
  HandCoinsIcon
} from "lucide-react";

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      {/* Nombre del sistema */}
      <div className="sidebar-header">
        <h1>SystemPark</h1>
      </div>

      {/* Lista de navegación */}
      <ul>
        <li>
          <Link to="/dashboard">
            <LayoutDashboard className="sidebar-icon" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/dashboard/reservas">
            <Calendar className="sidebar-icon" />
            Reservas
          </Link>
        </li>
        <li>
          <Link to="/dashboard/espacios">
            <Building className="sidebar-icon" />
            Espacios
          </Link>
        </li>
        <li>
          <Link to="/dashboard/pagos">
            <CreditCard className="sidebar-icon" />
            Pagos
          </Link>
        </li>
        {/*<li>
          <Link to="/dashboard/notificaciones">
            <Bell className="sidebar-icon" />
            Notificaciones
          </Link>
        </li>
         {/*<li>
          <Link to="/clientes">
            <Users className="sidebar-icon" />
            Clientes
          </Link>
        </li>*/}
        <li>
          <Link to="/dashboard/usuarios">
            <UserCog className="sidebar-icon" />
            Usuarios
          </Link>
        </li>
        <li>
          <Link to="/dashboard/tarifas">
            <HandCoinsIcon className="sidebar-icon" />
            Tarifas
          </Link>
        </li>
      </ul>

      {/* Botón de cerrar sesión */}
      <button onClick={logout}>
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;
