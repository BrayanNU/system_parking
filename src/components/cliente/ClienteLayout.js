// src/components/cliente/ClienteLayout.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClienteSidebar from "./ClienteSidebar";

// Aquí luego creas estos componentes
import Disponibilidad from "./Disponibilidad";
import MisReservas from "./MisReservas";
import ClientePagos from "./MisPagos";

const ClienteLayout = () => {
  return (
    <div>
      <ClienteSidebar />
      <div style={{ padding: "16px" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/cliente/disponibilidad" />} />
          <Route path="disponibilidad" element={<Disponibilidad />} />
          <Route path="reservas" element={<MisReservas />} />
          <Route path="pagos" element={<ClientePagos />} />
          <Route path="pagos/:idReserva" element={<ClientePagos />} />
        </Routes>
      </div>
    </div>
  );
};

export default ClienteLayout;
