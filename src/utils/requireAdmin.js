// src/utils/RequireAdmin.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireAdmin = ({ children }) => {
  const { usuario } = useContext(AuthContext);

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (usuario.rol !== "admin") {
    return <Navigate to="/cliente" />;
  }

  return children;
};

export default RequireAdmin;
