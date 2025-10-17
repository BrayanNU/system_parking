// server/routes/tarifas.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/tarifasController");
const { auth, requireAdmin } = require("../middleware/auth");

// Rutas CRUD protegidas
router.get("/", auth, requireAdmin, ctrl.getAll);
router.get("/activa", auth, requireAdmin, ctrl.getActiva);
router.post("/", auth, requireAdmin, ctrl.create);
router.put("/:id", auth, requireAdmin, ctrl.update);
router.delete("/:id", auth, requireAdmin, ctrl.remove);


router.get("/activa-cliente", ctrl.getActivaCl); // cliente

module.exports = router;
