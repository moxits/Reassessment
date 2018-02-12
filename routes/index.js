var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
var currentClient = client.getClient();
var passwordHash = require('password-hash');
var auth = require('../utils/auth');
/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.user){
    currentClient.query('SELECT * FROM business ORDER BY id DESC',(err,result)=>{      
    res.render('index', { title: 'Express',user:'none',newbusiness:result})
  });
  }else{
    currentClient.query('SELECT * FROM business',(err,result)=>{ 
    res.render('index',{title:'ReviewR',user:req.session.user,newbusiness:result});
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
router.get('/writeareview/:id',auth.requireLogin,function(req,res,next){
  query = {
    text: 'SELECT * FROM business WHERE id = $1',
    values:[req.params.id]
  }
  currentClient.query(query,(err,result)=>{
    if (err) {console.log(err);}
    else{
      res.render('writereview',{business:result.rows[0]})
    }
  });
});
router.get('/view-business/:id',function(req,res,next){
  query = {
    text: 'SELECT * FROM business WHERE id = $1',
    values:[req.params.id]
  }
  currentClient.query(query,(err,result)=>{
    if(err){console.log(err);}
    else{
      if (!req.session.user){
        res.render('viewbusiness',{login:'false',user:result.rows[0]});
      }else{
        res.render('viewbusiness',{login:'true',user:result.rows[0]});
      }
    }
  });
});
module.exports = router;
