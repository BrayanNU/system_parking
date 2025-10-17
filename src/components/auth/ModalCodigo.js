import React, { useState } from "react";
import Swal from "sweetalert2";
import usuariosService from "../../services/usuariosService";
import "../../styles/login.css";

const ModalCodigo = ({ correo, formData, onClose, onSuccess }) => {
  const [codigo, setCodigo] = useState("");

  const handleVerificar = async () => {
    try {
      const res = await usuariosService.verificarCodigo(correo, codigo);

      if (res.data.validado) {
        // ✅ Aseguramos que todos los datos, incluyendo el teléfono, sean enviados
        const usuarioData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono, // 👈 Se agrega explícitamente
          correo: formData.correo,
          contrasena: formData.contrasena,
        };

        // 🧩 Crear el usuario cliente
        await usuariosService.create_cli(usuarioData);

        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso!",
          text: "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
          customClass: {
            confirmButton: "btn-register_ex",
          },
        });

        onSuccess(); // redirige al login desde Register.js
      } else {
        Swal.fire({
          icon: "error",
          title: "Código incorrecto",
          text: "El código que ingresaste no es válido.",
          customClass: {
            confirmButton: "btn-error",
          },
        });
      }
    } catch (error) {
      console.error("Error verificando código o creando usuario:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se puede usar un correo ya registrado o hubo un problema al verificar el código.",
        customClass: {
          confirmButton: "btn-error",
        },
      });
    }
  };

  return (
    <div className="modal-codigo">
      <div className="modal-content">
        <h3>Verifica tu correo</h3>
        <p>
          Hemos enviado un código de 6 dígitos a: <b>{correo}</b>
        </p>

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

export default ModalCodigo;
