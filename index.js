const mongoose = require('mongoose');
const express = require('express');
const users = require('./routes/users');
const login = require('./routes/login');
const books = require('./routes/books');

const app = express();

mongoose
  .connect('mongodb://localhost/library', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('connected to Mongodb...'))
  .catch((err) => console.log('could not connect to Mongodb...'));

app.use(express.json());
app.use('/api/users', users);
app.use('/api/login', login);
app.use('/api/books', books);

const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
