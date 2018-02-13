var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
//var currentClient = client.getClient();
var passwordHash = require('password-hash');
var auth = require('../utils/auth');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/newreview',function(req,res,next){
  console.log(req.body);
  client.query("SELECT * FROM business WHERE id=:id",
  {replacements:{id:req.body.businessid}})
  .then(result=>{
    console.log(result[0][0])
    var agg = (result[0][0].rating*result[0][0].numreviews);
    var agg2 = (agg +parseFloat(req.body.rating));
    var newRating = agg2/(result[0][0].numreviews + 1);
    client.query("UPDATE business SET numreviews = numreviews + 1,rating = :newrating WHERE id = :userid",
  {replacements:{newrating:newRating,userid:req.body.businessid}})
  .then(results=>{
    console.log(results[0][0])
  }).catch(err=>console.log(err))
  }).catch(err=>console.log(err));
  client.query("INSERT INTO reviews(userid,business,day,content,rating) VALUES(:us,:bus,CURRENT_DATE,:description,:num) RETURNING *",
  {replacements:{us:req.session.user.id,bus:req.body.businessid,description:req.body.content,num:req.body.rating}})
  .then(result=>{
    res.send(result[0][0]);
  }).catch(err=>console.log(err));

});
router.post('/register',function(req,res){

    var hashed = passwordHash.generate(req.body.password);
    var query;
    if (req.body.type == 'personal'){
      client.query("INSERT INTO personal(type,name,email,password) VALUES(:type,:name,:email,:password) RETURNING *",
      {replacements:{type:req.body.type,name:req.body.name,email:req.body.email,password:hashed}})
        .then(result=>{
          req.session.user = result[0];
          res.send(result[0]);
        }).catch(err => console.log(err));
      }else{
        client.query("INSERT INTO business(type,name,email,password) VALUES(:type,:name,:email,:password) RETURNING *",
        {replacements:{type:req.body.type,name:req.body.name,email:req.body.email,password:hashed}})
          .then(result=>{
            console.log(result);
            req.session.user = result[0];
            res.send(result[0]);
          }).catch(err => console.log(err));
      }
});
router.post('/login',function(req,res,next){
    if (req.body.type == 'personal'){
      client.query("SELECT * FROM personal WHERE email = :email",
      {replacements:{email:req.body.email}})
      .then(result=>{
        if (result.length == 0){
          res.send("NOT FOUND");
        }else{
          if (passwordHash.verify(req.body.password,result[0][0].password)){
            req.session.user = result[0][0];
            res.send(result[0][0]);
          }else{
            res.send("Incorrect Password")
          }
        }
      }).catch(err=>res.status(400).send(err));
    }else{
      client.query("SELECT * FROM business WHERE email = :email",
      {replacements:{email:req.body.email}})
      .then(result=>{
        if (result.length == 0){
          res.send("NOT FOUND");
        }else{
          if (passwordHash.verify(req.body.password,result[0][0].password)){
            req.session.user = result[0][0];
            res.send(result[0][0]);
          }else{
            res.send("Incorrect Password")
          }
        }
      }).catch(err=>res.status(400).send(err));
    }
  
});
router.post('/update-personal',function(req,res,next){
  client.query("SELECT * FROM personal WHERE email = :email",
  {replacements:{email:req.session.user.email}})
  .then(result=>{
    if(passwordHash.verify(req.body.password,result[0][0].password)){
      var hashed;
      if (req.body.newpassword != ''){ hashed = passwordHash.generate(req.body.newpassword);}
      else{hashed = passwordHash.generate(req.body.password);} 
      client.query("UPDATE personal SET name=:name,password=:password,zipcode=:zipcode,city=:city,state=:state WHERE email = :email",
      {replacements:{name:req.body.name,password:hashed,zipcode:req.body.zipcode,city:req.body.city,state:req.body.state,email:req.session.user.email}})
      .then(result=>{
        res.send("SUCCESS");})
      .catch(err=>res.status(400).send(err));
  }
}).catch(err=>res.status(400).send(err));
});
router.post('/update-business',function(req,res,next){
  client.query("SELECT * FROM business WHERE email = :email",
  {replacements:{email:req.session.user.email}})
  .then(result=>{
    if(passwordHash.verify(req.body.password,result[0][0].password)){
      var hashed;
      if (req.body.newpassword != ''){ hashed = passwordHash.generate(req.body.newpassword);}
      else{hashed = passwordHash.generate(req.body.password);} 
      client.query("UPDATE business SET name=:name,password=:password,zipcode=:zipcode,city=:city,state=:state WHERE email = :email",
      {replacements:{name:req.body.name,password:hashed,zipcode:req.body.zipcode,city:req.body.city,state:req.body.state,email:req.session.user.email}})
      .then(result=>{
        res.send("SUCCESS");})
      .catch(err=>res.status(400).send(err));
  }
}).catch(err=>res.status(400).send(err));
});
router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});
module.exports = router;
