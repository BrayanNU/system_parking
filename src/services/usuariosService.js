// src/services/usuariosService.js
import api from "./api";

export const login = async (correo, contrasena) => {
  const res = await api.post("/usuarios/login", { correo, contrasena });
  return res.data;
};

export const register = async (usuario) => {
  const res = await api.post("/usuarios/register", usuario);
  return res.data;
};
