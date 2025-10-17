// server/routes/clientes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/clientesController");
const { auth, requireAdmin } = require("../middleware/auth");

// Lectura (cualquier usuario autenticado puede listar clientes)
router.get("/", auth, ctrl.getAll);
router.get("/:id", auth, ctrl.getById);

// Escritura/borrado → solo admin
router.post("/", auth, requireAdmin, ctrl.create);
router.put("/:id", auth, requireAdmin, ctrl.update);
router.delete("/:id", auth, requireAdmin, ctrl.remove);

module.exports = router;
