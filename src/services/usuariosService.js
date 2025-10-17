// src/services/usuariosService.js
import api from "./api";

const getAll = () => api.get("/usuarios");
const create = (data) => api.post("/usuarios", data);
const update = (id, data) => api.put(`/usuarios/${id}`, data);
const remove = (id) => api.delete(`/usuarios/${id}`);

const login = async (correo, contrasena) => {
  const response = await api.post("/usuarios/login", { correo, contrasena });
  return response.data; // ✅ aquí devolvemos token + usuario
};

const create_cli = async (data) => {
  const response = await api.post("/usuarios/register", data);
  return response.data;
};


const enviarCodigo = (correo, esRegistro = false) =>
  api.post("/usuarios/enviar-codigo", { correo, esRegistro });



const verificarCodigo = (correo, codigo) =>
  api.post("/usuarios/verificar-codigo", { correo, codigo });

const solicitarRestablecimiento = (correo) =>
  api.post("/usuarios/solicitar-restablecimiento", { correo });

const restablecerContrasena = (token, nuevaContrasena) =>
  api.post("/usuarios/restablecer-contrasena", { token, nuevaContrasena });



const usuariosService = {
  getAll,
  create,
  update,
  remove,
  login,
  create_cli,
  enviarCodigo,
  verificarCodigo,
  solicitarRestablecimiento,
  restablecerContrasena,
};

export default usuariosService;
