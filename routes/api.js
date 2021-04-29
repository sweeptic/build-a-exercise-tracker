const express = require('express');
const apiController = require('../controllers/api');
const router = express.Router();

router.get('/hello', apiController.getHello);

router.post('/users', apiController.addNewUser);
router.get('/users', apiController.getAllUser);

router.post('/users/:_id/exercises', apiController.addNewExercise);

router.get('/users/:_id/logs/', apiController.getUserLog);

module.exports = router;
