// server/routes/reservas.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservasController');
const { auth, requireAdmin } = require('../middleware/auth');

// Rutas CRUD
router.get('/', auth, requireAdmin, ctrl.getAll);
router.post('/', auth, requireAdmin, ctrl.create); // 👈 corregido
router.put('/:id', auth, requireAdmin, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

router.post("/cliente", auth, ctrl.createCliente);
router.get("/mis-reservas", auth, ctrl.getByUsuario);


module.exports = router;
