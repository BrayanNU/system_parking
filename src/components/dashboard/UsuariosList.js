import React, { useState, useEffect } from "react";
import usuariosService from "../../services/usuariosService";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "../../styles/usuarios.css";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    rol: "cliente",
    estado: "activo",
  });
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await usuariosService.getAll();
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await usuariosService.update(editId, formData);
        setEditId(null);
      } else {
        const res = await usuariosService.create(formData);
        if (res.data?.correo && res.data?.contrasenaTemporal) {
          setFormData((prev) => ({ ...prev, correo: res.data.correo }));

          Swal.fire({
            title: "Usuario creado",
            html: `
              <p><strong>Correo:</strong> ${res.data.correo}</p>
              <p><strong>Contraseña temporal:</strong> <span style="color:red;">${res.data.contrasenaTemporal}</span></p>
            `,
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        }
      }

      fetchUsuarios();
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        rol: "cliente",
        estado: "activo",
      });
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
    });
    setEditId(usuario.id_usuario);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este usuario será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await usuariosService.remove(id);
        fetchUsuarios();
        Swal.fire({
          title: "Eliminado",
          text: "El usuario ha sido eliminado con éxito.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } catch (error) {
        Swal.fire({
          title: "Error eliminando usuario",
          html: `<p><strong>Error:</strong> ${error.message || error}</p>`,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    }
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { name: "ID", selector: (row) => row.id_usuario, sortable: true },
    { name: "Nombre", selector: (row) => `${row.nombre} ${row.apellido}`, sortable: true },
    { name: "Correo", selector: (row) => row.correo },
    { name: "Rol", selector: (row) => row.rol },
    { name: "Estado", selector: (row) => row.estado },
    {
      name: "Acciones",
      cell: (row) => (
        <>
          <button
            className="boton_edit"
            onClick={() => handleEdit(row)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button
            className="boton_delete"
            onClick={() => handleDelete(row.id_usuario)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="container_usuarios">
      {/* Formulario */}
      <div className="mb-4">
        <h2>{editId ? "Editar Usuario" : "Registrar Usuario"}</h2>
        <form onSubmit={handleSubmit} className="form_user">
          <div className="bloq_form">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="bloq_form">
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="bloq_form">
            <input
              type="email"
              name="correo"
              placeholder="Correo generado"
              value={formData.correo}
              readOnly
              className="form-control"
            />
          </div>
          <div className="bloq_form">
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="admin">Administrador</option>
              <option value="trabajador">Trabajador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div className="bloq_form">
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <button type="submit" className="boton_usuario">
            {editId ? "Guardar Cambios" : "Agregar"}
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
       
        <div className="pest-tabla">
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="buscador"
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredUsuarios}
          pagination
          highlightOnHover
          responsive
          striped
        />
      </div>
    </div>
  );
};

export default UsuarioList;
