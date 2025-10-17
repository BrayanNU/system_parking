// src/services/ticketsService.js
import api from "./api";

const getByReserva = (idReserva) => api.get(`/tickets/reserva/${idReserva}`);

const ticketsService = { getByReserva };

export default ticketsService;
