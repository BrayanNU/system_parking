// server/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); // Permite que el backend reciba datos JSON

// Conexión con la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'system_parking',
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión con MySQL:', err);
  } else {
    console.log('Conexión exitosa a MySQL');
  }
});

// API para obtener reservas
app.get('/api/reservas', (req, res) => {
  connection.query('SELECT * FROM reservas', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener reservas' });
    }
    res.json(results);
  });
});

// API para agregar una nueva reserva
app.post('/api/reservas', (req, res) => {
  const { placa, tipo, horaEntrada, horaSalida, fecha } = req.body;
  connection.query(
    'INSERT INTO reservas (placa, tipo, horaEntrada, horaSalida, fecha) VALUES (?, ?, ?, ?, ?)',
    [placa, tipo, horaEntrada, horaSalida, fecha],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al crear la reserva' });
      }
      res.status(201).json({ id: results.insertId, placa, tipo, horaEntrada, horaSalida, fecha });
    }
  );
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
