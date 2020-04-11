const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const passwordComplexity = require('joi-password-complexity');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024,
  },
});

adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, name: this.name }, 'jwtKey');
  return token;
};

const Admin = mongoose.model('Admin', adminSchema);

function validateAdmin(admin) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });

  return schema.validate(admin);
}

function validatePassword(admin) {
  const complexityOptions = {
    min: 4,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
  };
  return passwordComplexity(complexityOptions).validate(admin.password);
}

exports.Admin = Admin;
exports.validateAdmin = validateAdmin;
exports.validatePassword = validatePassword;
