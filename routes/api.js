const express = require('express');
const apiController = require('../controllers/api');
const router = express.Router();

router.get('/hello', apiController.getHello);

router.post('/users', apiController.addNewUser);

router.post('/users/:_id/exercises', apiController.addNewExercise);

module.exports = router;
