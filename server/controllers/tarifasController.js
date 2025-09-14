// server/controllers/tarifasController.js
const Tarifas = require('../models/tarifasModel');

async function getAll(req, res, next) {
  try {
    const rows = await Tarifas.list();
    res.json(rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { descripcion, precio, unidad } = req.body;
    if (!descripcion || !precio || !unidad) {
      return res.status(400).json({ error: 'descripcion, precio y unidad son requeridos' });
    }
    const id = await Tarifas.create({ descripcion, precio, unidad });
    res.status(201).json({ idTarifa: id });
  } catch (err) { next(err); }
}

module.exports = { getAll, create };
