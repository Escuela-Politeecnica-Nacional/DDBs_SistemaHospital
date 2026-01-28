const express = require('express');
const router = express.Router();
const doctoresController = require('../controllers/doctoresController');

router.get('/', doctoresController.getDoctores);
router.post('/', doctoresController.addDoctor);
router.put('/:id', doctoresController.editDoctor);
router.delete('/:id', doctoresController.deleteDoctor);

module.exports = router;
