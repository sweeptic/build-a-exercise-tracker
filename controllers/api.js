const mongoose = require('mongoose');
const USER = require('../models/user');
const LOG = require('../models/log');

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
  const _id = req.params._id;

  console.log(typeof req.body.date);

  if (date === '' || typeof date === 'undefined') {
    date = new Date(); //.toISOString().slice(0, 10);
  } else {
    if (new Date(date) == 'Invalid Date') {
      return res.status(404).json('Date is not in correct format');
    }
  }

  if (description === '') {
    return res.status(404).json('Description field is required');
  }

  if (duration === '') {
    return res.status(404).json('Duration field is required');
  }

  const createdExercise = new LOG({
    description,
    duration,
    date,
    creator: _id,
  });

  let user;

  try {
    user = await USER.findById(_id);
  } catch (error) {
    return res.status(500).json('Server error');
  }

  if (!user) {
    return res.status(404).json('Could not find user for provided id.');
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdExercise.save({ session: sess });

    user.log.push(createdExercise);
    await user.save({ session: sess });
    await sess.commitTransaction();

    return res.json({
      _id: user._id,
      username: user.username,
      date: createdExercise.date.toDateString(),
      duration: createdExercise.duration,
      description: createdExercise.description,
    });
  } catch (err) {
    console.log(err);

    return res.status(404).json('Creating exercise failed, please try again');
  }
};

exports.getUserLog = async (req, res, next) => {
  let id = mongoose.Types.ObjectId(req.params._id);

  const dateQueryFactory = (queryProp, value) =>
    value === undefined ? null : { [queryProp]: [`$date`, new Date(value)] };

  let pipeline = [
    {
      $match: {
        $expr: {
          $and: [
            { $in: ['$_id', '$$localLOG'] },
            dateQueryFactory('$gte', req.query.from),
            dateQueryFactory('$lt', req.query.to),
          ].filter(q => q !== null),
        },
      },
    },
    {
      $project: {
        _id: 0,
        // date: {
        //   $dateToString: { format: '%Y-%m-%d', date: '$date' },
        // },
        date: '$date',
        description: '$description',
        duration: '$duration',
      },
    },
  ];

  if (req.query.limit) pipeline.push({ $limit: +req.query.limit });

  const query = await USER.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'logs',
        let: {
          localLOG: '$log',
        },
        pipeline: pipeline,
        as: 'log',
      },
    },

    {
      $project: {
        username: 1,
        _id: 1,
        log: 1,
        count: { $size: '$log' },
      },
    },
  ])
    .exec()
    .then(items => items[0]);

  console.log(query);
  return res.json(query);
};
