// server/controllers/dashboardController.js
const dashboardModel = require("../models/dashboardModel");

exports.getDashboardData = async (req, res) => {
  try {
    const data = await dashboardModel.getDashboardData();
    res.json({
      success: true,
      message: "✅ Datos del dashboard obtenidos correctamente",
      data,
    });
  } catch (error) {
    console.error("❌ Error en dashboardController:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo datos del dashboard",
      error: error.message,
    });
  }
};
