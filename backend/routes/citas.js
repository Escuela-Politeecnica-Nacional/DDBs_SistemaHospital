const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

router.get('/', citasController.getCitas);
router.post('/', citasController.addCita);
router.put('/:id', citasController.editCita);
router.delete('/:id', citasController.deleteCita);

module.exports = router;
