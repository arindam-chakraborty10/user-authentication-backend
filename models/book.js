const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  author: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  price: Number,
});

const Book = mongoose.model('Book', bookSchema);

function validate(book) {
  const schema = Joi.object({
    name: Joi.string().required(),
    author: Joi.string().required(),
    price: Joi.number(),
  });
  return schema.validate(book);
}

exports.Book = Book;
exports.validate = validate;
