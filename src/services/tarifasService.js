// src/services/tarifasService.js
import api from "./api";

// Obtener todas las tarifas
const getAll = () => api.get("/tarifas");

const getActivaCl= () => api.get("/tarifas/activa-cliente");

// (opcional) obtener solo la activa
const getActiva = () => api.get("/tarifas/activa");

// (opcional) crear una tarifa
const create = (data) => api.post("/tarifas", data);

// (opcional) actualizar tarifa
const update = (id, data) => api.put(`/tarifas/${id}`, data);

// (opcional) eliminar tarifa
const remove = (id) => api.delete(`/tarifas/${id}`);

const tarifasService = {
  getAll,
  getActiva,
  getActivaCl,
  create,
  update,
  remove,
};

export default tarifasService;
