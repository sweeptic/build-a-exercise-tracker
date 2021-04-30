const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema({
  username: { type: String, required: true },
  log: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Log' }],
});

module.exports = mongoose.model('User', userSchema);
