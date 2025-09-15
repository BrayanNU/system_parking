import React, { useState, useEffect } from "react";
import usuariosService from "../../services/usuariosService";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contrasena: "",
    rol: "cliente",
    estado: "activo",
  });
  const [editId, setEditId] = useState(null);

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
        await usuariosService.create(formData);
      }
      fetchUsuarios();
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        contrasena: "",
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
      contrasena: "", // no se carga para no mostrar hash
      rol: usuario.rol,
      estado: usuario.estado,
    });
    setEditId(usuario.id_usuario);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
      try {
        await usuariosService.remove(id);
        fetchUsuarios();
      } catch (error) {
        console.error("Error eliminando usuario:", error);
      }
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Formulario */}
      <div style={{ flex: "1" }}>
        <h2>{editId ? "Editar Usuario" : "Registrar Usuario"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />
          {!editId && (
            <input
              type="password"
              name="contrasena"
              placeholder="Contraseña"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          )}
          <select name="rol" value={formData.rol} onChange={handleChange} required>
            <option value="admin">Administrador</option>
            <option value="trabajador">Trabajador</option>
            <option value="cliente">Cliente</option>
          </select>
          <select name="estado" value={formData.estado} onChange={handleChange} required>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <button type="submit">
            {editId ? "Guardar Cambios" : "Agregar Usuario"}
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div style={{ flex: "2" }}>
        <h2>Lista de Usuarios</h2>
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id_usuario}>
                <td>{u.id_usuario}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.estado}</td>
                <td>
                  <button onClick={() => handleEdit(u)}>Editar</button>
                  <button onClick={() => handleDelete(u.id_usuario)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuarioList;
