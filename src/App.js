// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importar los componentes de las opciones del administrador
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ReservaList from './components/ReservaList';
import EspacioList from './components/EspacioList';
import PagoList from './components/PagoList';
import Notificacion from './components/Notificacion';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Header /> {/* Cabecera fija */}
        <div className="main-container">
          <Sidebar /> {/* Sidebar fijo */}
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reservas" element={<ReservaList />} />
              <Route path="/espacios" element={<EspacioList />} />
              <Route path="/pagos" element={<PagoList />} />
              <Route path="/notificaciones" element={<Notificacion />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
