// server/routes/tarifas.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tarifasController');
const { auth, requireAdmin } = require('../middleware/auth');

router.get('/', auth, requireAdmin, ctrl.getAll);
router.post('/', auth, requireAdmin, ctrl.create);

module.exports = router;
