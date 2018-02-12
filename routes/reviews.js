var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
var currentClient = client.getClient();
var passwordHash = require('password-hash');
var auth = require('../utils/auth');

router.post('/newreview',function(req,res,next){
    const query1 = {
        text: 'INSERT INTO'
    }

});