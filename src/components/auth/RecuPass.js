import React, { useState } from "react";
import usuariosService from "../../services/usuariosService";
import Swal from "sweetalert2";
import "../../styles/login.css";
import PagImg from "../uploads/login_back.png";

const RecuPass = () => {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usuariosService.solicitarRestablecimiento(correo);

      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Te hemos enviado un enlace de restablecimiento a tu correo.",
        confirmButtonText: "Aceptar",
      });

      setCorreo("");
    } catch (error) {
      console.error("Error al enviar correo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró una cuenta con ese correo o hubo un problema al enviar el mensaje.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="general">
      <div className="outer-container">
        <div className="top-container">
          <img src={PagImg} alt="Logo" className="login-logo" />
        </div>

        <div className="login-container">
          <form onSubmit={handleEnviar} className="form">
            <h2>Recuperar Contraseña</h2>
            <p>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <button
              type="submit"
              className="boton_login"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuPass;
