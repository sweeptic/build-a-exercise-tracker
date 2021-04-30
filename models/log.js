const mongoose = require('mongoose');
const Schema = mongoose.Schema;

logSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date },
  creator: { type: mongoose.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Log', logSchema);
