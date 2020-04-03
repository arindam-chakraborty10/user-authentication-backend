const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/./.env' });

module.exports = {
  key: process.env.jwtkey,
  testAccount_user: process.env.testAccount_user,
  testAccount_pass: process.env.testAccount_pass
};
