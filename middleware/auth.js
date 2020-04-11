const express = require('express');
const jwt = require('jsonwebtoken');
const { key } = require('../config');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token)
    return res
      .status(401)
      .send({ Error: 'Access denied! no token provided..' });

  try {
    const decoded = jwt.verify(token, key);
    console.log(decoded);
    req.user = decoded;
    req.token = token;

    next();
  } catch (ex) {
    res.status(400).send({ Error: 'Invalid token...' });
    //res.send(ex);
  }
}

module.exports = auth;
