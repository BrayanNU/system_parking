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

router.post("/register", usuariosController.create_cli);

// Verificación por correo
router.post("/enviar-codigo", usuariosController.enviarCodigo);
router.post("/verificar-codigo", usuariosController.verificarCodigo);

router.post("/solicitar-restablecimiento", usuariosController.solicitarRestablecimiento);
router.post("/restablecer-contrasena", usuariosController.restablecerContrasena);

module.exports = router;
