var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
var currentClient = client.getClient();
var passwordHash = require('password-hash');