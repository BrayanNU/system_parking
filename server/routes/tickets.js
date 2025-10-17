// server/routes/tickets.js
const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/ticketsController");

router.get("/reserva/:idReserva", ticketsController.getByReserva);

module.exports = router;
