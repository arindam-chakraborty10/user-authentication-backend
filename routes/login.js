const generateOtp = require('../source/otp');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const Joi = require('@hapi/joi');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const id = req.user._id;
    let check = await User.findById(id);
    if (!check)
      return res.status(400).send({ Error: 'Invalid token provided' });

    const { error } = validate(req.body);
    if (error) return res.status(400).send({ Error: error.details[0].message });

    if (check.email != req.body.email)
      return res.status(400).send({ Error: 'Invalid token provided' });

    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send({ Error: 'Invalid email or password...' });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send({ Error: 'Invalid email or password...' });

    let otp = generateOtp(req.body.email);
    console.log(otp);

    const salt = await bcrypt.genSalt(10);
    //otp = await bcrypt.hash(user.otp, salt);

    user = await User.findByIdAndUpdate(
      user._id,
      { $set: { otp: otp, expiredTime: Date.now() } },
      { new: true }
    );

    const token = await user.generateAuthToken();
    var response = {
      message: `Welcome ${user.name}`,
      token: token,
    };
    res.send(response);
  } catch (er) {
    console.log(er);
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    //Get otp from header
    const getOtp = req.header('x-auth-otp');
    if (!getOtp)
      return res
        .status(401)
        .send({ Error: 'Access denied! no OTP provided..' });

    const date = Date.now();
    console.log(req.user);
    const id = req.user._id;
    console.log(id);
    let user = await User.findById(id);
    if (!user) return res.status(400).send({ Error: 'Invalid token provided' });

    /*const value = bcrypt.compare(getOtp, user.otp);
  console.log(typeof value);*/
    console.log(user);
    if (getOtp != user.otp || Date.now() - user.expiredTime > 1000 * 60 * 10)
      return res
        .status(401)
        .send({ Error: 'Access denied! Invalid OTP provided..' });

    res.send(_.pick(user, ['name', 'email', 'img', 'tokens']));
  } catch (er) {
    console.log(er);
  }
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });
  return schema.validate(req);
}

module.exports = router;
