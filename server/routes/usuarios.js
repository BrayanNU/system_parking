// server/routes/usuarios.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuariosController');
const { auth, requireAdmin } = require('../middleware/auth');

// Para crear el primer admin (puedes deshabilitarlo luego)
router.post('/register', ctrl.register);

// Login admin
router.post('/login', ctrl.login);

// Ver perfil del admin logueado
router.get('/me', auth, requireAdmin, ctrl.me);

module.exports = router;
