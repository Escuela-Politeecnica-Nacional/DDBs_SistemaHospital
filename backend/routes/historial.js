const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialController');

router.get('/', historialController.getHistorial);
router.post('/', historialController.addHistorial);
router.put('/:id', historialController.editHistorial);
router.delete('/:id', historialController.deleteHistorial);

module.exports = router;
