const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuariosModel");
const Verification = require("../models/usuariosModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
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

function generarCorreo(nombre, apellido) {
  const base = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`;
  const random = Math.floor(Math.random() * 1000);
  const dominio = "systemparking.com";
  return `${base}${random}@${dominio}`;
}

// Función auxiliar para generar contraseñas automáticas
function generarContrasena(longitud = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pass = "";
  for (let i = 0; i < longitud; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Crear usuario con contraseña automática
exports.create = async (req, res) => {
  try {
    let { nombre, apellido, correo, rol, estado } = req.body;

    if (!correo) {
      correo = generarCorreo(nombre, apellido);
    }

    // Generar contraseña automática
    const contrasenaGenerada = generarContrasena();

    // Encriptar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasenaGenerada, salt);

    const result = await Usuario.create({
      nombre,
      apellido,
      correo,
      contrasena: hashedPassword,
      rol,
      estado
    });

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellido,
      correo,
      rol,
      estado,
      contrasenaTemporal: contrasenaGenerada // 👈 solo mostrar una vez
    });
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
      { 
        id_usuario: user.id_usuario, 
        rol: user.rol,
        nombre: user.nombre,
        apellido: user.apellido
      },
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

// --- REGISTRO CLIENTE ---
exports.create_cli = async (req, res) => {
  try {

    console.log("📩 Datos recibidos en create_cli:", req.body);

    const { nombre, apellido, correo, contrasena, telefono } = req.body;
    if (!nombre || !apellido || !correo || !contrasena|| !telefono)
      return res.status(400).json({ error: "Todos los campos son obligatorios" });

    const hashed = await bcrypt.hash(contrasena, 10);
    const nuevo = await Usuario.create_cli({
      nombre,
      apellido,
      telefono,
      correo,
      contrasena: hashed,
      rol: "cliente",
      estado: "activo",
    });

    return res.status(201).json({ ok: true, usuario: nuevo });
  } catch (err) {
    console.error("create_cli error:", err);
    return res.status(500).json({ error: "Error creando usuario" });
  }
};

// --- ENVÍO Y VERIFICACIÓN DE CÓDIGO (simple y funcional) ---
exports.enviarCodigo = async (req, res) => {
  try {
    const { correo, esRegistro } = req.body;
    if (!correo) return res.status(400).json({ error: "Correo requerido" });


    if (!esRegistro) {
      const usuario = await Usuario.getByCorreo(correo);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

    // 🔹 Si el usuario es admin → no se le pide verificación
    if (usuario.rol === "admin") {
        return res.json({
          message: "El rol 'admin' no requiere verificación por código.",
          skipVerification: true,
        });
      }
    }


    // Generar código 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en memoria (suficiente para pruebas)
    global.codigosVerificacion = global.codigosVerificacion || {};
    global.codigosVerificacion[correo] = codigo;

    // Crear transporter según env o usar Ethereal
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Usar SMTP real (Gmail, Mailtrap, etc.)
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === "true" || true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Crear cuenta de prueba Ethereal
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("🧪 Usando Ethereal test account (no poner en producción).");
    }

    // Preparar correo (HTML y texto)
    const mailOptions = {
      from: `"${process.env.FROM_NAME || "PlazaPark"}" <${process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@example.com"}>`,
      to: correo,
      subject: "Código de verificación - PlazaPark",
      text: `Tu código de verificación es: ${codigo}`,
      html: `
        <p>Tu código de verificación es:</p>
        <h2>${codigo}</h2>
        <p>Válido por unos minutos.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Si usamos Ethereal: mostrar URL de preview en consola
    if (nodemailer.getTestMessageUrl && info && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("👀 Preview URL (Ethereal):", previewUrl);
      }
    }

    res.json({ message: "Código enviado correctamente" });
  } catch (error) {
    console.error("Error enviando código:", error);
    res.status(500).json({ error: "Error al enviar el código" });
  }
};

exports.verificarCodigo = async (req, res) => {
  const { correo, codigo } = req.body;
  if (
    global.codigosVerificacion &&
    global.codigosVerificacion[correo] &&
    global.codigosVerificacion[correo] === codigo
  ) {
    delete global.codigosVerificacion[correo];
    return res.json({ validado: true });
  } else {
    return res.status(400).json({ validado: false, error: "Código incorrecto" });
  }
};

// Variable temporal para tokens (si no tienes BD para tokens)


// ✅ 1. Solicitar restablecimiento
exports.solicitarRestablecimiento = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.getByCorreo(correo);
    if (!usuario) {
      return res
        .status(404)
        .json({ message: "No se encontró una cuenta con ese correo." });
    }

    // Generar token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutos

    await Usuario.saveResetToken(correo, token, expiresAt);

    // Enlace (ajustado a entorno local)
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Configuración del correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "newchangan2023@gmail.com", // ⚠️ reemplázalo por el tuyo
        pass: "plllodzmtxmgrqfw", // ⚠️ usa contraseña de aplicación de Gmail
      },
    });

    const mailOptions = {
      from: "tucorreopepe@gmail.com",
      to: correo,
      subject: "Restablecimiento de contraseña",
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>El enlace expirará en 10 minutos.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Correo de restablecimiento enviado correctamente." });
  } catch (error) {
    console.error("Error al solicitar restablecimiento:", error);
    res
      .status(500)
      .json({
        message:
          "Ocurrió un error al procesar la solicitud. Intenta nuevamente.",
      });
  }
};

// 🔹 2. Restablecer contraseña
exports.restablecerContrasena = async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  try {
    const resetData = await Usuario.getResetToken(token);
    if (!resetData || new Date(resetData.expires_at) < new Date()) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    const usuario = await Usuario.getByCorreo(resetData.correo);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Hashear contraseña nueva
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    await Usuario.updatePassword(usuario.id_usuario, hashedPassword);

    // Eliminar token después de usarlo
    await Usuario.deleteResetToken(resetData.correo);

    res.json({ message: "Contraseña restablecida correctamente." });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};