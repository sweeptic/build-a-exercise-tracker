const shortid = require('shortid');
const USER = require('../models/user');

exports.getHello = (req, res, next) => {
  res.json({ greeting: 'hello from fcc-exercise-tracker' });
};

exports.addNewUser = async (req, res, next) => {
  const user = req.body.username;
  const userId = shortid.generate();

  try {
    let findOne = await USER.findOne({ name: user });

    if (findOne) {
      res.json({
        name: findOne.name,
        _id: findOne.id,
      });
    } else {
      findOne = new USER({
        name: user,
        _id: userId,
      });
      await findOne.save();

      res.json({
        name: findOne.name,
        _id: findOne.id,
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
        _id: user.id,
      };
    })
  );
};

exports.addNewExercise = async (req, res, next) => {
  const { description, duration, date } = req.body;
  const id = req.body[':_id'];

  console.log(id, description, duration, date);

  res.json({ ok: 'ok' });
};
