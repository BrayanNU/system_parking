// server/controllers/clientesController.js
const bcrypt = require("bcryptjs");
const Clientes = require("../models/clientesModel");

// Generar correo automático si no viene
function generarCorreo(nombre = "usuario", apellido = "") {
  const base = `${(nombre || "user").toLowerCase()}.${(apellido || "").toLowerCase()}`.replace(/\s+/g, "");
  const dominio = "systemparking.com";
  // Si base queda como ".", sustituimos
  const local = base === "." ? `user${Date.now()}` : base;
  return `${local}@${dominio}`;
}

// Generar contraseña temporal
function generarContrasena(longitud = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pass = "";
  for (let i = 0; i < longitud; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Listar clientes
exports.getAll = async (req, res) => {
  try {
    const rows = await Clientes.getAll();
    res.json(rows);
  } catch (err) {
    console.error("Error listando clientes:", err);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

// Obtener cliente por id
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const cliente = await Clientes.getById(id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (err) {
    console.error("Error getById cliente:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// Crear cliente (admin)
exports.create = async (req, res) => {
  try {
    let { nombre, apellido, correo, estado } = req.body;

    if (!correo) {
      correo = generarCorreo(nombre || "cliente", apellido || "");
    }

    const contrasenaGenerada = generarContrasena();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasenaGenerada, salt);

    const result = await Clientes.create({
      nombre,
      apellido,
      correo,
      contrasena: hashedPassword,
      estado,
    });

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      correo,
      estado: estado || "activo",
      contrasenaTemporal: contrasenaGenerada,
    });
  } catch (err) {
    console.error("Error creando cliente:", err);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

// Actualizar cliente
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    await Clientes.update(id, req.body);
    res.json({ message: "Cliente actualizado correctamente" });
  } catch (err) {
    console.error("Error actualizando cliente:", err);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

// Eliminar cliente
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await Clientes.remove(id);
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    console.error("Error eliminando cliente:", err);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};

