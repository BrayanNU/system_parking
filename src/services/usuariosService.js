// src/services/usuariosService.js
import api from "./api";

const getAll = () => api.get("/usuarios");
const create = (data) => api.post("/usuarios", data);
const update = (id, data) => api.put(`/usuarios/${id}`, data);
const remove = (id) => api.delete(`/usuarios/${id}`);
const login = async (correo, contrasena) => {
  const response = await api.post("/usuarios/login", { correo, contrasena });
  return response.data; // 👈 aquí devolvemos solo los datos (token, user)
};

export default {
  getAll,
  create,
  update,
  remove,
  login,
};
