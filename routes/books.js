const auth = require('../middleware/auth');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const {Book, validate} = require('../models/book');
const mongoose = require('mongoose');
const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
    const books = await Book.find().select('name author price -_id').sort('name');
    res.send(books);
});

router.post('/', auth, async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let book = new Book({
      name: req.body.name,
      author: req.body.author,
      price: req.body.price
    });

    book = await book.save();
    res.send(_.pick(book, ['name', 'author', 'price']));
});

router.put('/:id', auth, async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const book = Book.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        author: req.body.author,
        price: req.body.price
    }, {new: true});

    if(!book) return res.status(404).send('The book with given id was not found..');

    res.send(book);
});

router.delete('/:id', auth, async (req, res) => {
    const book = await Book.findByIdAndRemove(req.params.id);

    if (!book) return res.status(404).send('The book with the given ID was not found.');

    res.send(book);
});

router.get('/:id', async (req, res) => {
    const book = await Book.findById(req.params.id);
  
    if (!book) return res.status(404).send('The book with the given ID was not found.');
  
    res.send(book);
});

module.exports = router;