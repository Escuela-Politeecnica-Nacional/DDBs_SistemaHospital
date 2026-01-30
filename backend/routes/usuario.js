const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/doctores', usuarioController.getDoctores);
router.get('/pacientes', usuarioController.getPacientes);
router.get('/especialidades', usuarioController.getEspecialidades);
router.get('/historiales', usuarioController.getHistoriales);
router.get('/consultorios', usuarioController.getConsultorios);
router.get('/citas', usuarioController.getCitas);
router.get('/centros', usuarioController.getCentros);

module.exports = router;