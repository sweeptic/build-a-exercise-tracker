const mongoose = require('mongoose');
const Schema = mongoose.Schema;

userSchema = new Schema({
  name: { type: String, required: true },
  _id: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
