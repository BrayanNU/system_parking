import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import usuariosService from "../../services/usuariosService";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import PagImg from "../uploads/login_back.png";
import Swal from "sweetalert2";
import ModalCodigoLogin from "./ModalCodigoLogin"; // 👈 nuevo modal

const Login = () => {
  const { login } = useContext(AuthContext);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tempData, setTempData] = useState(null);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    // 1️⃣ Verificamos credenciales
    const data = await usuariosService.login(correo, contrasena);

    // 🔹 Si el rol es admin → entra directo sin verificación
    if (data.usuario.rol === "admin" || data.usuario.rol === "cliente") {
      login(data);
      navigate("/dashboard");
      return; // ✅ terminamos aquí, sin pedir código
    }

    // 2️⃣ Si es cliente → se envía código
    const resp = await usuariosService.enviarCodigo(correo);

    // Si el backend responde que no requiere verificación, también entra directo
    if (resp?.data?.skipVerification) {
      login(data);
      navigate("/dashboard");
      return;
    }

    // 3️⃣ Mostrar alerta y modal para ingresar código
    setTempData(data);
    setMostrarModal(true);

    Swal.fire({
      icon: "info",
      title: "Verificación requerida",
      text: "Se ha enviado un código a tu correo para completar el inicio de sesión.",
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: "btn-confirm",
      },
    });
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    setError("La contraseña o el correo son incorrectos");
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "La contraseña o correo son incorrectos",
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton: "btn-error",
      },
      willOpen: () => {
        const button = document.querySelector(".swal2-confirm");
        if (button) {
          button.style.transition = "background-color 0.3s ease";
          button.addEventListener("mouseenter", () => {
            button.style.backgroundColor = "#ff5722";
          });
          button.addEventListener("mouseleave", () => {
            button.style.backgroundColor = "";
          });
        }
      },
    });
  }
};

  // 3️⃣ Se ejecuta si el usuario verifica correctamente el código
  const handleCodigoVerificado = () => {
    if (tempData) {
      login(tempData);

      if (tempData.usuario.rol === "admin") navigate("/dashboard");
      else if (tempData.usuario.rol === "cliente") navigate("/cliente");

      setMostrarModal(false);
    }
  };

  return (
    <div className="general">
      <div className="outer-container">
        <div className="top-container">
          <img src={PagImg} alt="Logo" className="login-logo" />
        </div>

        <div className="login-container">
          <form onSubmit={handleSubmit} className="form">
            <h2>PlazaPark</h2>
            <h3>Bienvenido</h3>

            <div className="input-wrapper">
              <div className="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0841c5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail-icon"
                >
                  <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="Correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <div className="input-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0841c5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-lock-keyhole-icon"
                >
                  <circle cx="12" cy="16" r="1" />
                  <rect x="3" y="10" width="18" height="12" rx="2" />
                  <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="boton_login">
              Iniciar Sesión
            </button>
            <button
              type="button"
              className="boton_register"
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>

            {/* 🔹 Mantuvimos tu bloque original */}
            <div className="rpass">
              {error && <p style={{ color: "red" }}>{error}</p>}
              <a href="/RecuPass">
                <b>¿Olvidaste tu contraseña?</b>
              </a>
            </div>

            <p>
              Al hacer clic en Continuar aceptas nuestros{" "}
              <b>Términos de servicio</b> y la Política de privacidad
            </p>
          </form>
        </div>
      </div>

      {/* 🧩 Modal de verificación 2FA */}
      {mostrarModal && (
        <ModalCodigoLogin
          correo={correo}
          onVerify={handleCodigoVerificado}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

export default Login;
