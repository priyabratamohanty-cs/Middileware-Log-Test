const mongoose = require('mongoose');

let newUserSchema = mongoose.Schema({
  emailId: { type: String, unique: true },
  password: { type: String },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
});

module.exports = mongoose.model('users', newUserSchema, 'users');
