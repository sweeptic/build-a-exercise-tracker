const mongoose = require('mongoose');
const USER = require('../models/user');
const EXERCISE = require('../models/exercise');

exports.getHello = (req, res, next) => {
  res.json({ greeting: 'hello from fcc-exercise-tracker' });
};

exports.addNewUser = async (req, res, next) => {
  const user = req.body.username;

  try {
    let findOne = await USER.findOne({ name: user });

    if (findOne) {
      res.json({
        name: findOne.name,
        _id: findOne._id,
      });
    } else {
      findOne = new USER({
        name: user,
      });
      await findOne.save();

      res.json({
        name: findOne.name,
        _id: findOne._id,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json('Server error');
  }
};

exports.getAllUser = async (req, res, next) => {
  let findAll = await USER.find();

  res.json(
    findAll.map(user => {
      return {
        name: user.name,
        _id: user._id,
      };
    })
  );
};

exports.addNewExercise = async (req, res, next) => {
  let { description, duration, date } = req.body;
  const id = req.body[':_id'];

  date === '' ? (date = new Date().toISOString().slice(0, 10)) : date;

  const createdExercise = new EXERCISE({
    description,
    duration,
    date,
    creator: id,
  });

  let user;

  try {
    user = await USER.findById(id);
  } catch (error) {
    console.log(error);
    res.status(500).json('Server error');
  }

  if (!user) {
    res.status(404).json('Could not find user for provided id.');
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdExercise.save({ session: sess });

    user.exercises.push(createdExercise);
    await user.save({ session: sess });
    await sess.commitTransaction();

    let userWithExercises;
    try {
      userWithExercises = await USER.findById(id).populate('exercises');
    } catch (err) {
      const error = new HttpError(
        'Fetching exercises failed, please try again later',
        500
      );
      return next(error);
    }

    if (!userWithExercises || userWithExercises.exercises.length === 0) {
      res.status(404).json('Could not find any exercises');
    }
    res.json({
      username: user.name,
      userid: user._id,
      exercises: userWithExercises.exercises.map(ex =>
        ex.toObject({ getters: true })
      ),
    });
  } catch (err) {
    res.status(404).json('Creating exercise failed, please try again');
  }
};
