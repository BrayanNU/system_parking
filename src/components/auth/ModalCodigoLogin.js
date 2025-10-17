import React, { useState } from "react";
import Swal from "sweetalert2";
import usuariosService from "../../services/usuariosService";
import "../../styles/login.css";

const ModalCodigoLogin = ({ correo, onVerify, onClose }) => {
  const [codigo, setCodigo] = useState("");

  const handleVerificar = async () => {
    try {
      const res = await usuariosService.verificarCodigo(correo, codigo);

      if (res.data.validado) {
        Swal.fire({
          icon: "success",
          title: "Código verificado",
          text: "Autenticación de dos factores completada ✅",
          confirmButtonText: "Continuar",
          customClass: { confirmButton: "btn-register_ex" },
        });
        onVerify();
      } else {
        Swal.fire("Error", "El código ingresado no es válido", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al verificar el código", "error");
    }
  };

  return (
    <div className="modal-codigo">
      <div className="modal-content">
        <h3>Verificación de seguridad</h3>
        <p>Hemos enviado un código a tu correo: <b>{correo}</b></p>

        <input
          type="text"
          placeholder="Ingresa el código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          maxLength={6}
          className="input-codigo"
        />

        <div className="modal-buttons">
          <button onClick={handleVerificar} className="boton_login">
            Verificar
          </button>
          <button onClick={onClose} className="boton_register">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCodigoLogin;
