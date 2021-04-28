const express = require('express');
const defaultController = require('../controllers/default');
const router = express.Router();

router.get('/', defaultController.getDefault);

module.exports = router;
