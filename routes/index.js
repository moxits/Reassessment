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
      res.render('index', { title: 'Express',user:'none',newbusiness:result[0]});
    });
  }else{
    client.query("SELECT * FROM business ORDER BY id DESC")
    .then(result=>{
      res.render('index', { title: 'Express',user:req.session.user,newbusiness:result[0]});
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
  console.log('req',req.session.user);
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
  var type='personal';
  var login;
  var user;
  if (!req.session.user){
    type == 'personal';
    login = "false";
  }else{
    login = "true";
    if (req.session.user.type == 'personal'){
      type ='personal';
    }else{
      type='business';
    }
  }
  client.query("SELECT * FROM business WHERE id = :id",
  {replacements:{id:req.params.id}})
  .then(result=>{
    user = result[0][0];
  }).catch(err=>res.status(400).send(err));
  client.query(`SELECT * FROM reviews WHERE business = '${req.params.id}'`)
  .then(result=>{
    res.render('viewbusiness',{login:login,user:user,type:type,reviews:result[0]});
  }).catch(err=>console.log(err))
});
router.get('/view-personal/:id',function(req,res,next){
  var login;
  var user;
  if (!req.session.user){
    login = "false";
  }else{
    login = "true";
  }
  client.query(`SELECT * FROM personal WHERE id = '${req.params.id}'`)
  .then(result=>{
    user = result[0][0];
  }).catch(err=>console.log(err));
  client.query(`SELECT * FROM reviews WHERE userid = '${req.params.id}'`)
  .then(result=>{
    res.render('viewpersonal',{login:login,user:user,reviews:result[0]});
  }).catch(err=>console.log(err));
});
router.post('/search/:searchterm',function(req,res,next){
  var toreturn = [];
  if (req.body.location != undefined){
    var city = req.body.location.split(",")[0];
    var state = req.body.location.split(",")[1];
    if (state != undefined){
      var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%' AND city ILIKE '%${city}%' AND state ILIKE '%${state}%'`;
    }else{
      if (req.body.location.length < 3){
        var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%' AND state ILIKE '%${city}%'`
      }else{
        var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%' AND city ILIKE '%${city}%'`
      }
    }
  }else{
    var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%'`;
  }
  client.query(query)
  .then(result=>{
    toreturn = toreturn.concat(result[0]);
  }).catch(err=>console.log(err));
  if (req.body.location != undefined){
    var city = req.body.location.split(",")[0];
    var state = req.body.location.split(",")[1];
    if (state != undefined){
      var query = `SELECT * FROM business WHERE category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}' AND city ILIKE '%${city}%' AND state ILIKE '%${state}%'`;
    }else{
      if (req.body.location.length < 3){
        var query = `SELECT * FROM business WHERE category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}' AND state ILIKE '%${city}%'`
      }else{
        var query = `SELECT * FROM business WHERE category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}' AND city ILIKE '%${city}%'`
      }
    }
  }else{
    var query = `SELECT * FROM business WHERE category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}'`;
  }
  client.query(query)
  .then(result=>{
    toreturn = toreturn.concat(result[0]);
    res.send(toreturn);
  }).catch(err=>console.log(err));
});
module.exports = router;
