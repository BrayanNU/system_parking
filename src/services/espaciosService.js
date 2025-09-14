import api from "./api";

const espaciosService = {
  getLibres: () => api.get("/espacios/libres"),
  getAll: () => api.get("/espacios"),
  create: (data) => api.post("/espacios", data),
  remove: (id) => api.delete(`/espacios/${id}`)
};

export default espaciosService;
