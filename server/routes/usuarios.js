// server/routes/usuarios.js
const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const { auth, requireAdmin } = require("../middleware/auth");

// CRUD Usuarios (solo admin)
router.get("/", auth, requireAdmin, usuariosController.getAll);
router.post("/", auth, requireAdmin, usuariosController.create);
router.put("/:id", auth, requireAdmin, usuariosController.update);
router.delete("/:id", auth, requireAdmin, usuariosController.remove);

// Login (público)
router.post("/login", usuariosController.login);

module.exports = router;
