// src/components/dashboard/TarifasList.js
import React, { useEffect, useState } from "react";
import tarifasService from "../../services/tarifasService";
import "../../styles/tarifas.css";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // <-- importante

const TarifasList = () => {
  const [tarifas, setTarifas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    dTarifa: "",
    descripcion: "",
    precio: "",
    unidad: "hora",
    activa: false,
  });
  const [tarifaEdit, setTarifaEdit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTarifas();
  }, []);

  const fetchTarifas = async () => {
    setLoading(true);
    try {
      const res = await tarifasService.getAll();
      setTarifas(res.data || []);
    } catch (error) {
      console.error("Error al cargar tarifas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tarifaEdit) {
        await tarifasService.update(tarifaEdit.idTarifa, formData);
        Swal.fire("Actualizado", "La tarifa ha sido actualizada", "success");
      } else {
        await tarifasService.create(formData);
        Swal.fire("Creado", "La tarifa ha sido creada", "success");
      }

      await fetchTarifas();
      resetForm();
    } catch (error) {
      console.error("Error guardando tarifa:", error);
      Swal.fire("Error", "No se pudo guardar la tarifa", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      dTarifa: "",
      descripcion: "",
      precio: "",
      unidad: "hora",
      activa: false,
    });
    setTarifaEdit(null);
  };

  const handleEdit = (tarifa) => {
    setTarifaEdit(tarifa);
    setFormData({
      dTarifa: tarifa.dTarifa,
      descripcion: tarifa.descripcion,
      precio: tarifa.precio,
      unidad: tarifa.unidad,
      activa: tarifa.activa === 1,
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar tarifa?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await tarifasService.remove(id);
        await fetchTarifas();
        Swal.fire("Eliminado", "Tarifa eliminada correctamente", "success");
      } catch (error) {
        console.error("Error eliminando tarifa:", error);
        Swal.fire("Error", "No se pudo eliminar la tarifa", "error");
      }
    }
  };

  const filteredTarifas = tarifas.filter((t) =>
    `${t.dTarifa} ${t.descripcion}`.toLowerCase().includes(searchText.toLowerCase())
  );

  // ✅ Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredTarifas.map((t) => ({
        ID: t.idTarifa,
        Nombre: t.dTarifa,
        Descripción: t.descripcion,
        Precio: t.precio,
        Unidad: t.unidad,
        Activa: t.activa ? "Sí" : "No",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tarifas");
    XLSX.writeFile(workbook, "Tarifas.xlsx");
  };

  // ✅ Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Listado de Tarifas", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Nombre", "Descripción", "Precio", "Unidad", "Activa"]],
      body: filteredTarifas.map((t) => [
        t.idTarifa,
        t.dTarifa,
        t.descripcion,
        `S/. ${t.precio}`,
        t.unidad,
        t.activa ? "Sí" : "No",
      ]),
    });
    doc.save("Tarifas.pdf");
  };

  const columns = [
    { name: "ID", selector: (row) => row.idTarifa, sortable: true },
    { name: "Nombre", selector: (row) => row.dTarifa },
    { name: "Descripción", selector: (row) => row.descripcion },
    { name: "Precio", selector: (row) => `S/. ${row.precio}` },
    { name: "Unidad", selector: (row) => row.unidad },
    {
      name: "Activa",
      selector: (row) => (row.activa ? "Sí" : " No"),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <>
          <button className="boton_editar" onClick={() => handleEdit(row)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button className="boton_editar" onClick={() => handleDelete(row.idTarifa)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="container-reserva">
      <h2>Gestión de Tarifas</h2>

      <div className="tabla-container">
        <form onSubmit={handleSubmit} className="form-tarifa">
          <input
            type="text"
            name="dTarifa"
            placeholder="Nombre de la tarifa"
            value={formData.dTarifa}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio (S/)"
            value={formData.precio}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          <select
            name="unidad"
            value={formData.unidad}
            onChange={handleChange}
            required
          >
            <option value="hora">Hora</option>
            <option value="dia">Día</option>
            <option value="mes">Mes</option>
          </select>

          <label>
            <input
              type="checkbox"
              name="activa"
              checked={formData.activa}
              onChange={handleChange}
            />
            Activa
          </label>

          <div>
            <button type="submit" className="boton-creartarifa">
              {tarifaEdit ? "Actualizar Tarifa" : "Crear"}
            </button>
            {tarifaEdit && (
              <button type="button" className="boton-pdf" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="pest-tabla">
          <input
            type="text"
            placeholder="Buscar tarifas..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="buscador"
          />


          <div className="botones-exportar">
            <button onClick={exportToExcel} className="boton-excel">Exportar a Excel</button>
            <button onClick={exportToPDF} className="boton-pdf">Exportar a PDF</button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredTarifas}
          pagination
          striped
          highlightOnHover
          responsive
          progressPending={loading}
          noDataComponent="No hay tarifas registradas"
        />
      </div>
    </div>
  );
};

export default TarifasList;
