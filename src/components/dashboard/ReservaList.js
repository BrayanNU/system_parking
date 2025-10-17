// src/components/dashboard/ReservaList.js
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useNavigate } from "react-router-dom"; 
import { useLocation } from "react-router-dom";


import reservasService from "../../services/reservasService";
import espaciosService from "../../services/espaciosService";
import tarifasService from "../../services/tarifasService";
import ModalEditReserva from "../layout/ModalEditReserva";
import ticketsService from "../../services/ticketsService";

import "../../styles/reserva.css";

// Helpers
const nowDateDDMMYYYY = (d = new Date()) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

const timeHHMMSS = (d = new Date()) => d.toTimeString().slice(0, 8);

const addHoursToTime = (timeStrHHMMSS, hoursToAdd) => {
  const [hh, mm, ss] = timeStrHHMMSS.split(":").map(Number);
  const base = new Date();
  base.setHours(hh, mm, ss, 0);
  return new Date(base.getTime() + hoursToAdd * 60 * 60 * 1000).toTimeString().slice(0, 8);
};

const ReservaList = () => {
  const [reservas, setReservas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [formData, setFormData] = useState({
    idEspacio: "",
    nombreCliente: "",
    apellidoCliente: "",
    placa: "",
    telefono: "",
    duracionHoras: "",
  });
  const [reservaParaEditar, setReservaParaEditar] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

  useEffect(() => {
    fetchReservas();
    fetchEspacios();
    fetchTarifas();
  }, []);

useEffect(() => {
    if (location.state?.idEspacio) {
      setFormData(prev => ({ ...prev, idEspacio: location.state.idEspacio }));
    }else{
      console.log("sadasdasdasdasd");
    }
  }, [location.state]);

  const fetchReservas = async () => {
    try {
      const res = await reservasService.getAll();
      setReservas(res.data || []);
    } catch (err) {
      console.error("Error cargando reservas:", err);
    }
  };

  const fetchEspacios = async () => {
    try {
      const res = await espaciosService.getAll();
      setEspacios(res.data || []);
    } catch (err) {
      console.error("Error cargando espacios:", err);
    }
  };

  const fetchTarifas = async () => {
    try {
      const res = await tarifasService.getAll();
      setTarifas(res.data || []);
    } catch (err) {
      console.error("Error cargando tarifas:", err);
    }
  };

const handleImprimirTicket = async (idReserva) => {
  try {
    const response = await ticketsService.getByReserva(idReserva);
    const ticket = response.data;

    if (!ticket) {
      Swal.fire("Error", "No se encontró ticket para esta reserva", "error");
      return;
    }

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <title>Ticket ${ticket.idTicket}</title>
          <style>
            @page { size: 90mm 120mm; margin: 0; } /* tamaño exacto */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100%;
            }
            .ticket {
              width: 90mm;
              height: 120mm;
              border: 1px dashed #FF5A00;
              padding: 8px;
              box-sizing: border-box;
              font-size: 14px;
              color: #FF5A00;
              text-align: center;
            }
            h2 {
              font-size: 18px;
              margin: 5px 0;
            }
            p {
              margin: 3px 0;
              font-size: 14px;
            }
            .barcode {
              margin: 8px 0;
            }
            .footer {
              margin-top: 6px;
              font-size: 10px;
              color: #FF5A00;
            }
            .logo {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 6px;
              margin-bottom: 6px;
            }
            svg {
              width: 24px;
              height: 24px;
              stroke: #FF5A00;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="logo">
              <!-- Icono Parking -->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <rect width="35" height="35" x="3" y="3" rx="2"/>
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
              </svg>
              <!-- Icono Carro -->
              <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car-front-icon lucide-car-front"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>
            </div>

            <h2>Ticket de Reserva</h2>
            <p><strong>ID Ticket:</strong> ${ticket.idTicket}</p>
            <p><strong>ID Reserva:</strong> ${ticket.idReserva}</p>
            
            <div class="barcode">
              <img id="barcode" 
                src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${ticket.codigoQR}&includetext&scale=2&fgcolor=C74600" 
                alt="Código de barras" />
            </div>
            <p><strong>Código Reserva:</strong><br>${ticket.codigoQR}</p>

            <p><strong>Fecha:</strong> ${new Date(ticket.fechaGeneracion).toLocaleString()}</p>
            <p><strong>Válido:</strong> ${ticket.valido ? "Sí" : "No"}</p>
            
            <div class="footer">
              <p>Gracias por su preferencia</p>
            </div>
          </div>

          <script>
            // Asegurar que cargue el código de barras antes de imprimir
            const img = document.getElementById("barcode");
            img.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo imprimir el ticket", "error");
  }
};






  const calcularPrecioTotal = (duracion) => {
    const t = tarifas.find((t) => t.activa && (t.unidad === "hora" || t.dTarifa?.toLowerCase().includes("hora"))) || tarifas[0];
    return t ? (Number(t.precio) * Number(duracion)).toFixed(2) : "0.00";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const duracion = Number(formData.duracionHoras);
      if (!formData.idEspacio || duracion <= 0) {
        return Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Completa todos los campos antes de guardar la reserva.",
        });
      }

      const fecha = nowDateDDMMYYYY();
      const horaEntrada = timeHHMMSS();
      const horaSalida = addHoursToTime(horaEntrada, duracion);
      const precioTotal = calcularPrecioTotal(duracion);

      await reservasService.create({
        ...formData,
        placa: formData.placa.toUpperCase(),
        telefono: formData.telefono.replace(/\D/g, ""),
        duracionHoras: duracion,
        fecha,
        horaEntrada,
        horaSalida,
        precioTotal,
        estado: "activo",
      });

      await fetchReservas();
      setFormData({
        idEspacio: "",
        nombreCliente: "",
        apellidoCliente: "",
        placa: "",
        telefono: "",
        duracionHoras: "",
      });

      Swal.fire({
        icon: "success",
        title: "Reserva creada",
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate("/dashboard/espacios");
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.error || "Hubo un problema al crear la reserva." });
    }
  };


  const handleSaveEdit = async (datosEditados) => {
    try {
      if (!reservaParaEditar) return;
      setReservaParaEditar(null);

      await reservasService.update(reservaParaEditar.idReserva, { ...reservaParaEditar, ...datosEditados });
      await fetchReservas();
      Swal.fire({ icon: "success", title: "Reserva actualizada", timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.error || "No se pudo actualizar la reserva." });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar reserva?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await reservasService.remove(id);
        await fetchReservas();
        Swal.fire({ icon: "success", title: "Eliminada", timer: 2000, showConfirmButton: false });
      } catch {
        Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar la reserva." });
      }
    }
  };

  // Export functions
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reservas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");
    XLSX.writeFile(workbook, "reservas.xlsx");
  };

const exportPDF = () => {
  const doc = new jsPDF();
  doc.text("Lista de Reservas", 14, 16);

  autoTable(doc, {  // usa autoTable así
    head: [["ID", "Espacio", "Cliente", "Placa", "Teléfono", "Fecha", "Entrada", "Salida", "Estado", "Total"]],
    body: reservas.map(r => [
      r.idReserva,
      r.numeroEspacio,
      `${r.nombreCliente} ${r.apellidoCliente}`,
      r.placa,
      r.telefono,
      r.fecha,
      r.horaEntrada,
      r.horaSalida,
      r.estado,
      r.precioTotal
    ]),
    startY: 20
  });

  doc.save("reservas.pdf");
};


const [searchText, setSearchText] = useState("");

// Filtrado de reservas
const filteredReservas = reservas.filter(
  r =>
    `${r.nombreCliente} ${r.apellidoCliente}`.toLowerCase().includes(searchText.toLowerCase())
);


  // Columns for DataTable
  const columns = [
    { name: "ID", selector: (row) => row.idReserva, sortable: true},
    { name: "Espacio", selector: (row) => row.numeroEspacio, sortable: true },
    { name: "Cliente", selector: (row) => `${row.nombreCliente} ${row.apellidoCliente}`, sortable: true },
    { name: "Placa", selector: (row) => row.placa },
    { name: "Teléfono", selector: (row) => row.telefono },
    { name: "Fecha", selector: (row) => row.fecha, sortable: true },
    { name: "Entrada", selector: (row) => row.horaEntrada },
    { name: "Salida", selector: (row) => row.horaSalida },
    { name: "Estado", selector: (row) => row.estado },
    { name: "Total", selector: (row) => `S/ ${row.precioTotal}` },
    {
      name: "Acciones",
      cell: (row) => (
        <>
          <button className="boton_editar" onClick={() => setReservaParaEditar(row)}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></button>
          <button className="boton_eliminar" onClick={() => handleDelete(row.idReserva)}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          <button className="boton_imprimir" onClick={() => handleImprimirTicket(row.idReserva)}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-check-icon lucide-printer-check"><path d="M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5"/><path d="m16 19 2 2 4-4"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/></svg></button>
        </>
      ),
    },
  ];

  return (
    <div className="container-reserva">
      <h2>Lista de Reservas</h2>

      <form onSubmit={handleSubmit} className="form-reserva">
        <div className="inputForm">
          <select
        className="form-select"
        value={formData.idEspacio}
        onChange={(e) => setFormData({ ...formData, idEspacio: e.target.value })}
      >
        <option value="">-- Espacio --</option>
        {espacios.map((esp) => (
          <option key={esp.idEspacio} value={esp.idEspacio}>
            {esp.numeroEspacio} {esp.estado === "ocupado" ? "(ocupado)" : ""}
          </option>
        ))}
      </select>


        </div>
        <div className="inputForm">
          <input className="form-control" type="text" placeholder="Nombre" value={formData.nombreCliente} onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })} />
        </div>
        <div className="col-md-2">
          <input className="form-control" type="text" placeholder="Apellido" value={formData.apellidoCliente} onChange={(e) => setFormData({ ...formData, apellidoCliente: e.target.value })} />
        </div>
        <div className="inputForm">
          <input className="form-control" type="text" placeholder="Placa" value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })} />
        </div>
        <div className="inputForm">
          <input className="form-control" type="tel" placeholder="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, "") })} />
        </div>
        <div className="inputForm">
          <input className="form-control" type="number" placeholder="Horas" value={formData.duracionHoras} min="1" step="1" onChange={(e) => setFormData({ ...formData, duracionHoras: e.target.value })} />
        </div>
        <div className="col-md-1">
          <button type="submit" className="boton_form">Crear</button>
        </div>
      </form>
      <div className="tabla-container">
        <div className="pest-tabla">
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="buscador"
          />
          <div className="fila_export">
            <button className="boton-excel" onClick={exportExcel}>Exportar Excel</button>
          <button className="boton-pdf" onClick={exportPDF}>Exportar PDF</button>
          </div>
          
        </div>

          <DataTable
            columns={columns}
            data={filteredReservas}
            pagination
            highlightOnHover
            responsive
            striped
          />
      </div>
      

      {reservaParaEditar && (
        <ModalEditReserva
          reserva={reservaParaEditar}
          onClose={() => setReservaParaEditar(null)}
          onSave={handleSaveEdit}
          espacios={espacios}
          tarifas={tarifas}
        />
      )}
    </div>
  );
};

export default ReservaList;
