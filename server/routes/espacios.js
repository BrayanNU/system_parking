// server/routes/espacios.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/espaciosController");
const { auth, requireAdmin } = require("../middleware/auth");

router.get("/publico", ctrl.getAllPublic); 
router.get("/libres", ctrl.getLibresCliente);
router.get("/libres-cliente", ctrl.getLibresCliente);

router.get("/", auth, requireAdmin, ctrl.getAll);
router.get("/libres", auth, requireAdmin, ctrl.getLibres);
router.post("/", auth, requireAdmin, ctrl.create);
router.put("/:id", auth, requireAdmin, ctrl.update);
router.delete("/:id", auth, requireAdmin, ctrl.remove);

module.exports = router;
