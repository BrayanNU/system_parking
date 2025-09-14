// server/routes/reservas.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservasController');
const { auth, requireAdmin } = require('../middleware/auth');

// Rutas CRUD
router.get('/', auth, requireAdmin, ctrl.getAll);
router.post('/', auth, requireAdmin, ctrl.create);
router.put('/:id', auth, requireAdmin, ctrl.update);  // ← reemplaza patch por put
router.delete('/:id', auth, requireAdmin, ctrl.remove);

module.exports = router;
