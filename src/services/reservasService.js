import api from "./api";

const getAll = () => api.get("/reservas");
const create = (data) => api.post("/reservas", data);
const update = (id, data) => api.put(`/reservas/${id}`, data);
const remove = (id) => api.delete(`/reservas/${id}`);

const reservasService = {
  getAll,
  create,
  update,
  remove,
};

export default reservasService;
