const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema({
  username: { type: String, required: true },
  exercises: [
    { type: mongoose.Types.ObjectId, required: true, ref: 'Exercise' },
  ],
});

module.exports = mongoose.model('User', userSchema);
