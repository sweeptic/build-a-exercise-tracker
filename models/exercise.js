const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exerciseSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: String, required: true },
  date: { type: Date },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
