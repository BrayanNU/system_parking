// server/controllers/usuariosController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuarios = require('../models/usuariosModel');

async function register(req, res, next) {
  try {
    const { nombre, apellido, correo, contrasena } = req.body;
    if (!nombre || !apellido || !correo || !contrasena) {
      return res.status(400).json({ error: 'Campos requeridos' });
    }
    const existe = await Usuarios.findByEmail(correo);
    if (existe) return res.status(409).json({ error: 'Correo ya registrado' });

    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const id = await Usuarios.create({ nombre, apellido, correo, contrasenaHash });
    res.status(201).json({ message: 'Admin creado', id_usuario: id });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body;
    const user = await Usuarios.findByEmail(correo);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
    if (user.estado !== 'activo') return res.status(403).json({ error: 'Usuario inactivo' });

    const payload = { id_usuario: user.id_usuario, correo: user.correo, rol: user.rol };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '8h' });

    res.json({
      token,
      usuario: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol,
      },
    });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const u = await Usuarios.getById(req.user.id_usuario);
    res.json(u);
  } catch (err) { next(err); }
}

module.exports = { register, login, me };
