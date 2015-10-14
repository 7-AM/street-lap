var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  created: { type: Date, default: Date.now }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};
