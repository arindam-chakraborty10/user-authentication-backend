const generateOtp = require('../source/otp');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const Joi = require('@hapi/joi');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password...');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send('Invalid email or password...');

  //Get otp from header
  const getOtp = req.header('x-auth-otp');
  if (!getOtp) return res.status(401).send('Access denied! no OTP provided..');

  const value = await bcrypt.compare(getOtp, user.otp);
  console.log(value);
  if (!value)
    return res.status(401).send('Access denied! Invalid OTP provided..');

  const token = await user.generateAuthToken();

  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string().required()
  });
  return schema.validate(req);
}

module.exports = router;
