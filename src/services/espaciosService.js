import api from "./api";

const espaciosService = {
  getLibresCliente: () => api.get("/espacios/libres-cliente"), // ✅ cliente

  getAll: () => api.get("/espacios"),
  getPublicos: () => api.get("/espacios/publico"),
  getById: (id) => api.get(`/espacios/${id}`),
  create: (data) => api.post("/espacios", data),
  remove: (id) => api.delete(`/espacios/${id}`)
};

export default espaciosService;
