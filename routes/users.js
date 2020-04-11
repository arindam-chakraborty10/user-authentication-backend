const generateOtp = require('../source/otp');
const auth = require('../middleware/auth');
const multer = require('multer');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const { User, validate, validatePassword } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const mkdirp = require('mkdirp');
const datetime = require('node-datetime');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = Date.now();
    const dt = datetime.create(date);
    const formatted = dt.format('d_m_yy');
    var dir = `./uploads/${formatted}`;
    mkdirp(dir)
      .then(() => {
        cb(null, dir);
      })
      .catch((err) => console.log(err));
    //cb(null, `./uploads/`);
  },
  filename: function (req, file, cb) {
    var ext = file.originalname.split('.')[1];
    cb(null, Date.now() + '_' + file.fieldname + '.' + ext);
  },
});

//check file type
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

/*const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }

    cb(undefined, true);
  },
});*/

router.post('/', upload.single('userImage'), async (req, res) => {
  try {
    console.log(req.file.path);
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ Error: error.details[0].message });

    const result = validatePassword(req.body);
    if (result.error)
      return res.status(400).send({
        Error:
          'password must contaion one uppercas,one lowercase,one numeric and one symbol',
      });

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).send({ Error: 'user is already resgistered...' });

    /*const otp = generateOtp(req.body.email);
  console.log(otp);*/

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      img: req.file.path,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const token = await user.generateAuthToken();
    /*user.tokens = user.tokens.concat({token});*/

    user = await user.save();

    res.header('x-auth-token', token).send(_.pick(user, ['name', 'email']));
  } catch (error) {
    res.status(402).send(error);
  }
});

module.exports = router;
