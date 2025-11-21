import React, { useEffect, useState } from "react";
import pagosService from "../../services/pagosService";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import "../../styles/pagos_cl.css";
import CardImg from "../uploads/card.png";
import YapeImg from "../uploads/yape_card.png";
import EfectivoImg from "../uploads/pagoefectivo.png";

const MisPagos = () => {
  const { idReserva } = useParams();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metodoPago, setMetodoPago] = useState(""); // Método seleccionado
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const cargarReservas = async () => {
      try {
        const res = await pagosService.getReservasPendientes();
        if (idReserva) {
          const idNum = Number(idReserva);
          const filtrada = res.data.filter((r) => r.idReserva === idNum);
          setReservas(filtrada);
        } else {
          setReservas(res.data);
        }
      } catch {
        Swal.fire(
          "Error",
          "No se pudieron cargar las reservas pendientes",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    cargarReservas();
  }, [idReserva]);

  const handlePago = (idReserva, metodo) => {
    Swal.fire({
      title: "Procesando pago",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    pagosService
      .actualizarPago(idReserva, metodo)
      .then(() => {
        Swal.fire("¡Éxito!", "Pago confirmado correctamente", "success");
        setReservas((prev) => prev.filter((r) => r.idReserva !== idReserva));
      })
      .catch(() => {
        Swal.fire("Error", "No se pudo confirmar el pago", "error");
      });
  };

  const handleMetodoPagoChange = (e) => {
    const metodoSeleccionado = e.target.value;

    // Si el usuario vuelve a hacer clic sobre el mismo método, lo deseleccionamos (ocultamos formulario)
    if (metodoPago === metodoSeleccionado) {
      setMetodoPago("");
      setFormData({});
      return;
    }

    // Si es uno nuevo, seleccionamos y preparamos datos
    setMetodoPago(metodoSeleccionado);
    setFormData({});

    if (metodoSeleccionado === "efectivo") {
      const codigoGenerado = generarCodigoEfectivo();
      setFormData({ codigoEfectivo: codigoGenerado });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const renderFormularioPago = (reserva) => {
    switch (metodoPago) {
      case "tarjeta":
        return (
          <div className="emer_pa">
            <div className="block_card">
              <img src={CardImg} alt="Logo" className="card_img" />
            </div>
            <label>Titular de la tarjeta:</label>
            <input
              type="text"
              name="titular"
              value={formData.titular || ""}
              onChange={handleInputChange}
              placeholder="Xxxxxx Xxxxx Xxxxx"
            />
            <hr></hr>
            <label>Número de tarjeta:</label>
            <input
              type="text"
              name="numeroTarjeta"
              value={formData.numeroTarjeta || ""}
              onChange={handleInputChange}
              placeholder="0000 0000 0000 0000"
            />
            <hr></hr>
            <div className="fatal">
              <div className="fech">
                <label for="fechaVencimiento">Fecha venc.:</label>
                <div class="fecha-vencimiento">
                  <input
                    type="text"
                    id="mes"
                    name="mes"
                    maxlength="2"
                    placeholder="MM"
                    oninput="validarMes(this)"
                  />
                  <span>/</span>
                  <input
                    type="text"
                    id="año"
                    name="año"
                    maxlength="2"
                    placeholder="YY"
                    oninput="validarAño(this)"
                  />
                </div>
              </div>
              <div className="fech">
                <label>CVV:</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv || ""}
                  onChange={handleInputChange}
                  placeholder="000"
                />
              </div>
            </div>
            <button onClick={() => handlePago(reserva.idReserva, "tarjeta")}>
              Pagar con Tarjeta
            </button>
          </div>
        );

      case "yape":
        return (
          <div className="emer_pa_yape">
            <div className="block_yape">
              <img src={YapeImg} alt="Logo" className="yape_img" />
            </div>
            <label>Ingresa tu celular Yape</label>
            <input
              className="num_yape"
              type="text"
              name="celularYape"
              value={formData.celularYape || ""}
              onChange={handleInputChange}
              placeholder="000 000 000"
            />
            <label>Código de aprobación</label>
            <div className="d-flex gap-2 justify-content-center mt-3">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <input
                  key={index}
                  id={`input${index + 1}`}
                  type="text"
                  maxLength="1"
                  className="form-control text-center"
                  style={{ width: "50px" }}
                  onInput={(e) => mover(e.target, `input${index + 2}`)}
                  name={`codigoAprobacion-${index}`}
                />
              ))}
            </div>
            <label>Encuéntralo en el menú de Yape.</label>
            <button onClick={() => handlePago(reserva.idReserva, "yape")}>
              Pagar con Yape
            </button>
          </div>
        );

      case "efectivo":
        return (
          <div className="emer_pa">
            <div className="block_efectivo">
              <img src={EfectivoImg} alt="Logo" className="efectivo_img" />
            </div>
            <label>
              <strong>Código de pago (CIP):</strong>
            </label>
            <p className="julls">
              Este código es necesario para completar tu pago en efectivo.
              Guarda el código y úsalo en el punto de pago.
            </p>
            <div className="codd">
              <input
                type="text"
                name="codigoEfectivo"
                value={formData.codigoEfectivo || ""}
                onChange={handleInputChange}
                placeholder="Código de 8 dígitos"
                maxLength="8"
                disabled
              />
              <button
                onClick={() => copiarAlPortapapeles(formData.codigoEfectivo)}
              >
                <i className="fa-regular fa-copy"></i>
              </button>
            </div>
            <p className="info_efe"><i class="fa-solid fa-circle-exclamation"></i> 
              Presenta este código al cajero para pagar en efectivo. Asegúrate
              de hacerlo antes de la fecha límite.<i class="fa-solid fa-circle-exclamation"></i>
            </p>
            <button onClick={() => handlePago(reserva.idReserva, "efectivo")}>
              Pagar en Efectivo
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const copiarAlPortapapeles = (codigo) => {
    navigator.clipboard
      .writeText(codigo)
      .then(() =>
        Swal.fire(
          "¡Copiado!",
          "El código ha sido copiado al portapapeles.",
          "success"
        )
      )
      .catch(() =>
        Swal.fire(
          "Error",
          "No se pudo copiar el código al portapapeles.",
          "error"
        )
      );
  };

  const mover = (actual, siguienteId) => {
    if (actual.value.length === 1) {
      const siguiente = document.getElementById(siguienteId);
      if (siguiente) siguiente.focus();
    }
  };

  const generarCodigoEfectivo = () => {
    let codigo = "";
    for (let i = 0; i < 8; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    return codigo;
  };

  if (loading) return <p>Cargando pagos pendientes...</p>;
  if (reservas.length === 0) return <p>
  <i className="fa-regular fa-circle-check" style={{ color: '#07CF68', marginRight:'5px' }}></i>
  No tienes pagos pendientes.
</p>


  return (
    <div className="mis-pagos-container">
      <h2>
        <strong>Pagos pendientes de tus reservas</strong>
      </h2>
      {reservas.map((reserva) => (
        <div key={reserva.idReserva} className="reserva-row">
          <div className="info_pago">
            <strong>Reserva #{reserva.idReserva}</strong>
            <p>Fecha Entrada: {reserva.fecha}</p>
            <p>Hora Entrada: {reserva.horaEntrada}</p>
            <p>Hora Salida: {reserva.horaSalida || "-"}</p>
            <p>Monto: S/. {reserva.precioTotal}</p>
          </div>

          <div className="metod">
            <p>
              <strong>Método de Pago</strong>
            </p>
            <label>
              <input
                type="radio"
                name="metodoPago"
                value="tarjeta"
                checked={metodoPago === "tarjeta"}
                onChange={handleMetodoPagoChange}
              />
              Pagar con Tarjeta
            </label>
            <label>
              <input
                type="radio"
                name="metodoPago"
                value="yape"
                checked={metodoPago === "yape"}
                onChange={handleMetodoPagoChange}
              />
              Pagar con Yape
            </label>
            <label>
              <input
                type="radio"
                name="metodoPago"
                value="efectivo"
                checked={metodoPago === "efectivo"}
                onChange={handleMetodoPagoChange}
              />
              Pagar en Efectivo
            </label>

            {/* Mostrar formulario solo si hay método seleccionado */}
            {metodoPago && renderFormularioPago(reserva)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MisPagos;
