const express = require('express');
const router = express.Router();
const { inspectTable } = require('../controllers/inspectController');

router.get('/:table', inspectTable);

module.exports = router;
