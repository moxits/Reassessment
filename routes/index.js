var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
//var currentClient = client.getClient();
var passwordHash = require('password-hash');
var auth = require('../utils/auth');
/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.user){
    client.query("SELECT * FROM business ORDER BY id DESC")
    .then(result=>{
      console.log(result[0]);
      res.render('index', { title: 'Express',user:'none',newbusiness:result[0]});
    });
  }else{
    client.query("SELECT * FROM business ORDER BY id DESC")
    .then(result=>{
      res.render('index', { title: 'Express',user:'none',newbusiness:result[0]});
    });
  }
});
router.get('/signup-page',function(req,res,next){
  res.render('signup');
});
router.get('/login-page',function(req,res,next){
  res.render('login');
});
router.get('/personal-profile',auth.requireLogin,function(req,res,next){
  res.render('personalprofilesettings',{user:req.session.user});
});
router.get('/business-profile',auth.requireLogin,function(req,res,next){
  res.render('businessprofilesettings',{user:req.session.user});
});
router.get('/personal',auth.requireLogin,function(req,res,next){
  res.render('personalprofile',{user:req.session.user});
});
router.get('/business',auth.requireLogin,function(req,res,next){
  res.render('businessprofile',{user:req.session.user});
});
router.get('/writereview/:id',auth.requireLogin,function(req,res,next){
  client.query("SELECT * FROM business WHERE id = :id",
  {replacements:{id:req.params.id}})
  .then(result=>{
    res.render('writereview',{business:result[0][0]})
  }).catch(err=>res.status(400).send(err));
});
router.get('/view-business/:id',function(req,res,next){
  client.query("SELECT * FROM business WHERE id = :id",
  {replacements:{id:req.params.id}})
  .then(result=>{
    if (!req.session.user){
      res.render('viewbusiness',{login:'false',user:result[0][0]});
    }else{
      res.render('viewbusiness',{login:'true',user:result[0][0]});
    }
  }).catch(err=>res.status(400).send(err));
});
module.exports = router;
