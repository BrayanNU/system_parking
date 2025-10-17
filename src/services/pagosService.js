// src/services/pagosService.js
import api from "./api";

const getAll = () => api.get("/pagos");
const create = (data) => api.post("/pagos", data);
const update = (id, data) => api.put(`/pagos/${id}`, data);
const remove = (id) => api.delete(`/pagos/${id}`);

const getByUsuario = (idUsuario) => api.get(`/pagos/usuario/${idUsuario}`);
const updateByReserva = (idReserva, data) => api.put(`/pagos/by-reserva/${idReserva}`, data);
const getReservasPendientes = () => api.get('/pagos/pendientes');
const actualizarPago = (idReserva, metodo) => api.put(`/pagos/by-reserva/${idReserva}`, { metodo });

const pagosService = {
  getAll,
  create,
  update,
  remove,
  updateByReserva,
  getByUsuario,
  getReservasPendientes,
  actualizarPago,
};

export default pagosService;
