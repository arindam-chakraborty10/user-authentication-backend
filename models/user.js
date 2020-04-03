const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const passwordComplexity= require('joi-password-complexity');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 1024
    },
    otp: String,

    img: {
        type: Buffer
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

});

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: this._id, name: this.name}, 'jwtKey');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required()
    });

    return schema.validate(user);
}


function validatePassword(user){
    const complexityOptions = {
        min: 4,
        max: 30,
        lowerCase: 1,
        upperCase: 1,
        numeric: 1,
        symbol: 1,
        //requirementCount: 2,
      }
       
    return passwordComplexity(complexityOptions).validate(user.password);
}

exports.User = User;
exports.validate = validateUser;
exports.validatePassword = validatePassword;