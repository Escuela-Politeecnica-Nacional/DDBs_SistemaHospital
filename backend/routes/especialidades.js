const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');

router.get('/', especialidadesController.getEspecialidades);
router.post('/', especialidadesController.addEspecialidad);
router.put('/:id', especialidadesController.editEspecialidad);
router.delete('/:id', especialidadesController.deleteEspecialidad);

module.exports = router;
