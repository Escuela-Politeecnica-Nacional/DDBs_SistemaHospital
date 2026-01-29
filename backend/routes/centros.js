const express = require('express');
const router = express.Router();
const centrosController = require('../controllers/centrosController');

router.get('/', centrosController.getCentros);

module.exports = router;
