const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');

// GET /api/pacientes?sede=centro|norte|sur
router.get('/', pacientesController.getPacientes);
// POST /api/pacientes?sede=centro|norte|sur
router.post('/', pacientesController.addPaciente);
// PUT /api/pacientes/:id?sede=centro|norte|sur
router.put('/:id', pacientesController.editPaciente);
// DELETE /api/pacientes/:id?sede=centro|norte|sur
router.delete('/:id', pacientesController.deletePaciente);

module.exports = router;
