// src/services/reservasService.js
import api from "./api";

const getAll = () => api.get("/reservas");

const create = (data) => api.post("/reservas", data); // 👈 renombrado a create

const createCliente = (data) => api.post("/reservas/cliente", data);
const getByUsuario = () => api.get("/reservas/mis-reservas");

const update = (id, data) => api.put(`/reservas/${id}`, data);
const remove = (id) => api.delete(`/reservas/${id}`);


const reservasService = {
  getAll,
  create,
  update,
  remove,

  createCliente,
  getByUsuario,
};

export default reservasService;





