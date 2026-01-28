const express = require('express');
const router = express.Router();
const consultoriosController = require('../controllers/consultoriosController');

router.get('/', consultoriosController.getConsultorios);
router.post('/', consultoriosController.addConsultorio);
router.put('/:id', consultoriosController.editConsultorio);
router.delete('/:id', consultoriosController.deleteConsultorio);

module.exports = router;
