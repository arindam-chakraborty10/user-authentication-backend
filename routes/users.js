const generateOtp = require('../middleware/otp');
const auth = require('../middleware/auth');
const multer = require('multer');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {User, validate, validatePassword} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

/*const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({storage: storage});*/

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/', upload.single('userImage'), async (req, res) => {
    console.log(req.file.buffer);
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const result = validatePassword(req.body);
    if(result.error) return res.status(400).send('password must contaion one uppercas,one lowercase,one numeric and one symbol');


    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send('user is already resgistered...');

    const otp = generateOtp(req.body.email);
    console.log(otp);
    
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        otp: otp,
        img: req.file.buffer

    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);
    user.otp = await bcrypt.hash(user.otp,salt);

    const token = await user.generateAuthToken();
    /*user.tokens = user.tokens.concat({token});*/

    user = await user.save();

    
    res.header('x-auth-token', token).send(_.pick(user, ['name', 'email']));

});


/* For view User*/

router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});


/* For user logout*/

router.post('/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            console.log(token.token);
            return token.token != req.token
        })
        await req.user.save()
        res.send(req.user.tokens)
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router;
