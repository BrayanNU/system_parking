// src/components/dashboard/ClientesList.js
import React, { useState, useEffect } from "react";
import clientesService from "../../services/clientesService";
import "../../styles/clientes.css";

const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    estado: "activo",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await clientesService.getAll();
      setClientes(res.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await clientesService.update(editId, formData);
        setEditId(null);
      } else {
        const res = await clientesService.create(formData);
        // Mostrar contraseña temporal si backend la devuelve
        if (res.data?.contrasenaTemporal) {
          alert(`Cliente creado.\nCorreo: ${res.data.correo}\nContraseña temporal: ${res.data.contrasenaTemporal}`);
        } else {
          alert("Cliente creado correctamente.");
        }
      }
      setFormData({ nombre: "", apellido: "", correo: "", estado: "activo" });
      fetchClientes();
    } catch (error) {
      console.error("Error guardando cliente:", error);
      alert("Error al guardar cliente (ver consola).");
    }
  };

  const handleEdit = (c) => {
    setFormData({
      nombre: c.nombre,
      apellido: c.apellido,
      correo: c.correo,
      estado: c.estado,
    });
    setEditId(c.id_usuario);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar cliente?")) return;
    try {
      await clientesService.remove(id);
      fetchClientes();
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      alert("No se pudo eliminar (ver consola).");
    }
  };

  return (
    <div className="container_clientes">
      <div style={{ flex: "1" }}>
        <h2>{editId ? "Editar Cliente" : "Registrar Cliente"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
          <input
            name="correo"
            placeholder="Correo (opcional, se genera si no se indica)"
            value={formData.correo}
            onChange={handleChange}
          />
          <select name="estado" value={formData.estado} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <button type="submit">{editId ? "Guardar" : "Agregar Cliente"}</button>
        </form>
      </div>

      <div style={{ flex: "2" }}>
        <h2>Lista de Clientes</h2>
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id_usuario}>
                <td>{c.id_usuario}</td>
                <td>{c.nombre} {c.apellido}</td>
                <td>{c.correo}</td>
                <td>{c.estado}</td>
                <td>
                  <button onClick={() => handleEdit(c)}>Editar</button>
                  <button onClick={() => handleDelete(c.id_usuario)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientesList;
