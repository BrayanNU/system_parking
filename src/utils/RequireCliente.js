// src/utils/RequireCliente.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireCliente = ({ children }) => {
  const { usuario } = useContext(AuthContext);

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (usuario.rol !== "cliente") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default RequireCliente;
