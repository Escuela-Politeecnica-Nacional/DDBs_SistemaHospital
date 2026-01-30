const express = require('express');
const router = express.Router();
const doctoresController = require('../controllers/doctoresControllerCentro');

router.get('/', doctoresController.getDoctores);
router.post('/', doctoresController.addDoctor);
router.put('/:id', doctoresController.editDoctor);
router.delete('/:id', doctoresController.deleteDoctor);
router.get('/:id', doctoresController.getDoctorById);

module.exports = router;
