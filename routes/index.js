var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
var currentClient = client.getClient();
var passwordHash = require('password-hash');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user){
    res.render('index', { title: 'Express' });
  }else{
    res.render('index',{title:'ReviewR',user:req.session.user});
  }
});
router.get('/signup-page',function(req,res,next){
  res.render('signup');
});
router.get('/login-page',function(req,res,next){
  res.render('login');
});
router.get('/personal-profile',function(req,res,next){
  res.render('personalprofilesettings',{user:req.session.user});
});


module.exports = router;
