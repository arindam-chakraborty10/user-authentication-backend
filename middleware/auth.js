const express = require('express');
const jwt = require('jsonwebtoken');
const { key } = require('../config');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied! no token provided..');

  try {
    const decoded = jwt.verify(token, key);
    req.user = decoded;
    req.token = token;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token...');
  }
}

module.exports = auth;
