// src/App.js
import React, { useContext } from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Layout
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

// Auth
import Login from "./components/auth/Login";

// Dashboard
import Dashboard from "./components/dashboard/Dashboard";
import ReservaList from "./components/dashboard/ReservaList";
import EspaciosList from "./components/dashboard/EspaciosList";
import PagoList from "./components/dashboard/PagoList";
import NotificacionList from "./components/dashboard/NotificacionList";
import UsuariosList from "./components/dashboard/UsuariosList";

const ProtectedLayout = () => {
  const { usuario } = useContext(AuthContext);

  if (!usuario) return <Login />;

  return (
    <div className="App">
      <Header />
      <div className="main-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reservas" element={<ReservaList />} />
            <Route path="/espacios" element={<EspaciosList />} />
            <Route path="/pagos" element={<PagoList />} />
            <Route path="/notificaciones" element={<NotificacionList />} />
            <Route path="/usuarios" element={<UsuariosList />} />
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
        <ProtectedLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
