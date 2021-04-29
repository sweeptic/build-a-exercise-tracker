const mongoose = require('mongoose');
const USER = require('../models/user');
const EXERCISE = require('../models/exercise');

exports.getHello = (req, res, next) => {
  res.json({ greeting: 'hello from fcc-exercise-tracker' });
};

exports.addNewUser = async (req, res, next) => {
  const user = req.body.username;

  try {
    let findOne = await USER.findOne({ username: user });

    if (findOne) {
      res.json({
        username: findOne.username,
        _id: findOne._id,
      });
    } else {
      findOne = new USER({
        username: user,
      });
      await findOne.save();

      res.json({
        username: findOne.username,
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
        username: user.username,
        _id: user._id,
      };
    })
  );
};

exports.addNewExercise = async (req, res, next) => {
  let { description, duration, date } = req.body;
  const id = req.body[':_id'];

  if (date === '') {
    date = new Date().toISOString().slice(0, 10);
  } else {
    if (new Date(date) == 'Invalid Date') {
      return res.status(404).json('Date is not in correct format');
    }
  }

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

    res.json({
      username: user.username,
      _id: user._id,
      date: new Date(createdExercise.date).toDateString(),
      duration: createdExercise.duration,
      description: createdExercise.description,
    });
  } catch (err) {
    res.status(404).json('Creating exercise failed, please try again');
  }
};

exports.getUserLog = async (req, res, next) => {
  const id = req.params._id;
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = req.query.limit ? req.query.limit : null;

  let user;

  if (from == 'Invalid Date' || to == 'Invalid Date') {
    return res.status(404).json('Date is not in correct format');
  }

  try {
    user = await USER.findById(id);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Server error');
  }
  //code duplication
  if (!user) {
    return res.status(404).json('Could not find user for provided id.');
  }

  let userWithExercises;
  try {
    userWithExercises = await USER.findById(id).populate('exercises');
  } catch (err) {
    return res
      .status(500)
      .json('Fetching exercises failed, please try again later');
  }

  //http://localhost:3000/api/users/608978aaa5a52f42505b6e6f/logs/?from=2021-04-01&to=2021-04-29&limit=789

  console.log(from);

  if (from || to) {
    userWithExercises.exercises = userWithExercises.exercises.filter(item =>
      from && !to
        ? item.date >= from
        : !from && to
        ? item.date <= to
        : from && to
        ? item.date >= from && item.date <= to
        : item
    );
  }

  if (limit) {
    userWithExercises.exercises.splice(
      limit,
      userWithExercises.exercises.length
    );
  }

  res.json({
    username: user.username,
    userid: user._id,
    exercises:
      userWithExercises.exercises.length !== 0
        ? userWithExercises.exercises.map(ex => ex.toObject({ getters: true }))
        : [],

    count: userWithExercises.exercises.length,
  });
};
