// src/components/Sidebar.js
import React from 'react';
import '../App.css'; 
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/reservas">Gestionar Reservas</Link></li>
        <li><Link to="/espacios">Gestionar Espacios</Link></li>
        <li><Link to="/pagos">Gestionar Pagos</Link></li>
        <li><Link to="/notificaciones">Enviar Notificaciones</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
