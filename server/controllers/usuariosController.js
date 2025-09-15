const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuariosModel");

// Obtener todos los usuarios
exports.getAll = async (req, res) => {
  try {
    const users = await Usuario.getAll();
    res.json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Crear usuario
exports.create = async (req, res) => {
  try {
    let { nombre, apellido, correo, contrasena, rol, estado } = req.body;

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const result = await Usuario.create({
      nombre,
      apellido,
      correo,
      contrasena: hashedPassword,
      rol,
      estado
    });

    res.status(201).json({ id: result.insertId, nombre, apellido, correo, rol, estado });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

// Actualizar usuario
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    await Usuario.update(id, req.body);
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// Eliminar usuario
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await Usuario.remove(id);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const user = await Usuario.getByCorreo(correo);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const validPass = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPass) return res.status(401).json({ error: "Contraseña incorrecta" });

    // Generar token
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error en login" });
  }
};
