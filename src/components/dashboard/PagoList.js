import "../../styles/pagos.css";
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import pagosService from "../../services/pagosService";

const PagosList = () => {
  const [pagos, setPagos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagoEdit, setPagoEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const res = await pagosService.getAll();
      setPagos(res.data || []);
    } catch (err) {
      console.error("Error cargando pagos:", err);
      Swal.fire("Error", "No se pudo cargar la lista de pagos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pago) => {
    setPagoEdit({ ...pago });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setPagoEdit(null);
  };

  const handleSave = async () => {
    if (!pagoEdit.metodo || !pagoEdit.estado) {
      Swal.fire("Campos incompletos", "Completa todos los campos antes de guardar.", "warning");
      return;
    }

    try {
      await pagosService.update(pagoEdit.idPago, {
        estado: pagoEdit.estado,
        metodo: pagoEdit.metodo,
      });

      await fetchPagos();
      handleCloseModal();

      Swal.fire("Guardado", "Pago actualizado correctamente", "success");
    } catch (err) {
      console.error("Error actualizando pago:", err);
      Swal.fire("Error", "No se pudo actualizar el pago", "error");
    }
  };

  const filteredPagos = pagos.filter((p) =>
    `${p.nombreCliente} ${p.apellidoCliente}`.toLowerCase().includes(searchText.toLowerCase())
  );

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPagos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");
    XLSX.writeFile(workbook, "pagos.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Lista de Pagos", 14, 16);

    autoTable(doc, {
      head: [["ID", "Reserva", "Cliente", "Placa", "Monto", "Método", "Fecha", "Estado"]],
      body: filteredPagos.map(p => [
        p.idPago,
        p.idReserva,
        `${p.nombreCliente} ${p.apellidoCliente}`,
        p.placa,
        `S/ ${p.monto}`,
        p.metodo,
        p.fechaPago,
        p.estado
      ]),
      startY: 20
    });

    doc.save("pagos.pdf");
  };

  const columns = [
    { name: "ID", selector: (row) => row.idPago, sortable: true },
    { name: "Reserva", selector: (row) => row.idReserva },
    { name: "Cliente", selector: (row) => `${row.nombreCliente} ${row.apellidoCliente}` },
    { name: "Placa", selector: (row) => row.placa },
    { name: "Monto", selector: (row) => `S/. ${row.monto}` },
    { name: "Método", selector: (row) => row.metodo },
    { name: "Fecha", selector: (row) => row.fechaPago },
    { name: "Estado", selector: (row) => row.estado },
    {
      name: "Acción",
      cell: (row) => (
        <button className="boton_editar" onClick={() => handleOpenModal(row)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
        </button>
      ),
    },
  ];

  return (
    <div className="container-reserva">
      <h2>Lista de Pagos</h2>

      <div className="tabla-container">
        <div className="pest-tabla">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="buscador"
          />
          <div className="fila_export">
            <button className="boton-excel" onClick={exportToExcel}>Exportar Excel</button>
            <button className="boton-pdf" onClick={exportToPDF}>Exportar PDF</button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredPagos}
          pagination
          striped
          highlightOnHover
          responsive
          progressPending={loading}
          noDataComponent="No hay pagos registrados"
        />
      </div>

      {/* Modal para editar */}
      {modalOpen && pagoEdit && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Pago</h3>

            <label>Método de pago:</label>
            <select
              className="select_pago"
              value={pagoEdit.metodo || ""}
              onChange={(e) => setPagoEdit({ ...pagoEdit, metodo: e.target.value })}
            >
              <option value="">-- Seleccionar --</option>
              <option value="efectivo">Efectivo</option>
              <option value="qr">QR</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="tarjeta">Tarjeta</option>
            </select>

            <label>Estado:</label>
            <select
              className="select_estado"
              value={pagoEdit.estado}
              onChange={(e) => setPagoEdit({ ...pagoEdit, estado: e.target.value })}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <div className="modal-actions">
              <button className="boton_pagos" onClick={handleSave}>Guardar</button>
              <button className="boton_pagos" onClick={handleCloseModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosList;
