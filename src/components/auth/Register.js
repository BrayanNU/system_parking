import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import usuariosService from "../../services/usuariosService";
import Swal from "sweetalert2";
import "../../styles/login.css";
import PagImg from "../uploads/login_back.png";
import ModalCodigo from "./ModalCodigo";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();

  try {
    // 1️⃣ Enviar código de verificación al correo
    await usuariosService.enviarCodigo(correo, true);

    Swal.fire({
      icon: "info",
      title: "Código enviado",
      text: "Revisa tu correo e ingresa el código para continuar",
      // Personalizar el color del botón
      customClass: {
        confirmButton: 'btn-confirm' // Esta es la clase personalizada para el botón
      }
    });

    // 2️⃣ Mostrar modal de código
    setMostrarModal(true);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo enviar el código de verificación",
      customClass: {
        confirmButton: 'btn-error' // Clase personalizada para el botón en caso de error
      }
    });
  }
};


  return (
    <div className="general">
      <div className="outer-container">
        <div className="top-container">
          <img src={PagImg} alt="Logo" className="login-logo" />
        </div>

        <div className="login-container_register">
          <form onSubmit={handleRegister} className="form">
            <h2>PlazaPark</h2>
            <h3>Crear cuenta</h3>

            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <input
                type="tel"
                placeholder="Número de teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="boton_login">
              Registrarse
            </button>

            <button
              type="button"
              className="boton_register"
              onClick={() => navigate("/login")}
            >
              Volver al Login
            </button>


          </form>
        </div>
      </div>

      {mostrarModal && (
        <ModalCodigo
          correo={correo}
          formData={{ nombre, apellido, telefono , correo, contrasena}}
          onClose={() => setMostrarModal(false)}
          onSuccess={() => navigate("/login")}
        />
      )}
    </div>
  );
};

export default Register;
