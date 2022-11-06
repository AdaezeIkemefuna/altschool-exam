const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'Please enter your first name'],
  },
  last_name: {
    type: String,
    required: [true, 'Please enter your last name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  }, 
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm Password'],
    validate: {
      //this validator only works on save/ create
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },

});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next){
  if(!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
})

const User = mongoose.model('User', userSchema);
module.exports = User;
