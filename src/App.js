// src/App.js
import React from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";


// Layout
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register"; // ✅ nuevo
import RecuPass from "./components/auth/RecuPass"; // ✅ agregado
import ResetPassword from "./components/auth/ResetPassword"; // ✅ agregado

// Dashboard (admin)
import Dashboard from "./components/dashboard/DashboardList";
import ReservaList from "./components/dashboard/ReservaList";
import EspaciosList from "./components/dashboard/EspaciosList";
import PagoList from "./components/dashboard/PagoList";
import NotificacionList from "./components/dashboard/NotificacionList";
import UsuariosList from "./components/dashboard/UsuariosList";
import TarifasList from "./components/dashboard/TarifasList";

// Cliente


// Protecciones
import ClienteLayout from "./components/cliente/ClienteLayout";
import RequireAdmin from "./utils/requireAdmin";

import RequireCliente from "./utils/RequireCliente";

// Layout para admin
const AdminLayout = () => {
  return (
    <div className="App">
      <Sidebar />
      <div className="main-container">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="reservas" element={<ReservaList />} />
            <Route path="espacios" element={<EspaciosList />} />
            <Route path="pagos" element={<PagoList />} />
            <Route path="notificaciones" element={<NotificacionList />} />
            <Route path="usuarios" element={<UsuariosList />} />
            <Route path="tarifas" element={<TarifasList />} />
          </Routes>

        </div>
      </div>
    </div>
  );
};



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirigir raíz al login */}
          <Route path="/" element={<Login />} />


          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* ✅ nueva ruta */}
          <Route path="/RecuPass" element={<RecuPass />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas admin */}
          <Route
            path="/dashboard/*"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          />

          {/* Rutas cliente */}
          <Route
            path="/cliente/*"
            element={
              <RequireCliente>
                <ClienteLayout />
              </RequireCliente>
            }
          /> 
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
