const express = require('express');
const apiController = require('../controllers/api');
const router = express.Router();

router.get('/hello', apiController.getHello);

router.post('/shorturl', apiController.postNew);

router.get('/shorturl/:short_url?', apiController.getShortURL);

module.exports = router;
