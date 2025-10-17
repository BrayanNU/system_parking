import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usuariosService from "../../services/usuariosService";
import Swal from "sweetalert2";
import "../../styles/login.css";

const ResetPassword = () => {
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const handleReset = async (e) => {
    e.preventDefault();

    if (contrasena !== confirmar) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    try {
      await usuariosService.restablecerContrasena(token, contrasena);
      Swal.fire({
        icon: "success",
        title: "Contraseña restablecida",
        text: "Ya puedes iniciar sesión con tu nueva contraseña.",
      });
      navigate("/login");
    } catch (error) {
      Swal.fire("Error", "El enlace ha expirado o es inválido", "error");
    }
  };

  return (
    <div className="general">
      <div className="outer-container">
        <div className="login-container">
          <form onSubmit={handleReset} className="form">
            <h2>Restablecer Contraseña</h2>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
            <button type="submit" className="boton_login">
              Restablecer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
