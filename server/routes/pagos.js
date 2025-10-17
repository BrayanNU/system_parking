// server/routes/pagos.js
const express = require("express");
const router = express.Router();
const pagosController = require("../controllers/pagosController");
const { auth, requireAdmin } = require("../middleware/auth");

// Rutas CRUD DEL ADMIN NO CAMBIAR 
router.get("/", auth, requireAdmin, pagosController.getAll);
router.post("/", auth, requireAdmin, pagosController.create); // ✅ ESTA LÍNEA FALTABA
router.put("/:id", auth, pagosController.update);
router.delete("/:id", auth, requireAdmin, pagosController.remove);

// Ruta para CLIENTE -> obtiene sus propios pagos
router.get("/usuario/:idUsuario", auth, pagosController.getByUsuario);
router.put("/by-reserva/:idReserva", auth, pagosController.updateByReserva);
router.get("/pendientes", auth, pagosController.getReservasPendientes);


module.exports = router;
