// server/server.js
require("dotenv").config();

require('dotenv').config();
require("./jobs/reservasJob");
const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios');
const reservasRoutes = require('./routes/reservas');
const espaciosRoutes = require('./routes/espacios');
const tarifasRoutes = require('./routes/tarifas');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API System Parking funcionando 🚗'));

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/espacios', espaciosRoutes);
app.use('/api/tarifas', tarifasRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
