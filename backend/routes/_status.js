const express = require('express');
const router = express.Router();
const { probeNodes } = require('../controllers/statusController');

router.get('/nodes', probeNodes);

module.exports = router;
