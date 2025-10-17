// src/services/clientesService.js
import api from "./api";

const getAll = () => api.get("/clientes");
const getById = (id) => api.get(`/clientes/${id}`);
const create = (data) => api.post("/clientes", data);
const update = (id, data) => api.put(`/clientes/${id}`, data);
const remove = (id) => api.delete(`/clientes/${id}`);

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
