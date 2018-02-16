var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
//var currentClient = client.getClient();
var path = require('path');
var fs = require('fs');
var passwordHash = require('password-hash');
var auth = require('../utils/auth');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/newreview',auth.requireLogin,function(req,res,next){
  let businessname = '';
  client.query(`UPDATE personal SET numreviews = numreviews+1 WHERE id='${req.session.user.id}' RETURNING *`)
  .then(result=>{
    req.session.user = result[0][0];
  }).catch(err=>console.log(err))
  client.query("SELECT * FROM business WHERE id=:id",
  {replacements:{id:req.body.businessid}})
  .then(result=>{
    businessname = result[0][0].name;
    var agg = (result[0][0].rating*result[0][0].numreviews);
    var agg2 = (agg +parseFloat(req.body.rating));
    var newRating = agg2/(result[0][0].numreviews + 1);
    client.query("UPDATE business SET numreviews = numreviews + 1,rating = :newrating WHERE id = :userid",
  {replacements:{newrating:newRating,userid:req.body.businessid}})
  .then(results=>{
    client.query(`INSERT INTO reviews(userid,business,businessname,city,state,photo,name,day,content,rating) VALUES('${req.session.user.id}','${req.body.businessid}','${businessname}','${req.session.user.city}','${req.session.user.state}','${req.session.user.photo}','${req.session.user.name}',CURRENT_DATE,'${req.body.content}','${req.body.rating}') RETURNING *`)
    .then(result=>{
      res.send(result[0][0]);
    }).catch(err=>console.log(err));
  }).catch(err=>console.log(err))
  }).catch(err=>console.log(err));
});
router.post('/register',function(req,res){

    var hashed = passwordHash.generate(req.body.password);
    if (req.body.type == 'personal'){
      client.query(`SELECT * FROM personal WHERE email = '${req.body.email}'`)
      .then(result=>{
        console.log("result length",result[0].length);
        if (result[0].length != 0){
          res.send("TAKEN");
        }else{
          client.query("INSERT INTO personal(type,name,email,password) VALUES(:type,:name,:email,:password) RETURNING *",
          {replacements:{type:req.body.type,name:req.body.name,email:req.body.email,password:hashed}})
            .then(result=>{
              req.session.user = result[0][0];
              res.send(result[0][0]);
            }).catch(err => console.log(err));
        }
      }).catch(err=>console.log(err));
      }else{
        client.query(`SELECT * FROM business WHERE email = '${req.body.email}'`)
        .then(result=>{
          if (result[0].length != 0){
            res.send("TAKEN");
          }else{
            client.query("INSERT INTO business(type,name,email,password) VALUES(:type,:name,:email,:password) RETURNING *",
            {replacements:{type:req.body.type,name:req.body.name,email:req.body.email,password:hashed}})
              .then(result=>{
                req.session.user = result[0][0];
                res.send(result[0][0]);
              }).catch(err => console.log(err));
          }
        }).catch(err=>console.log(err));
      }
});
router.post('/login',function(req,res,next){
    if (req.body.type == 'personal'){
      client.query(`SELECT * FROM personal WHERE email= '${req.body.email}'`)
      .then(result=>{
        if (result[0].length == 0){
          res.send("NOT FOUND");
        }else{
          if (passwordHash.verify(req.body.password,result[0][0].password)){
            req.session.user = result[0][0];
            console.log("id: ",req.session.user.id);
            res.send(result[0][0]);
          }else{
            res.send("INCORRECT PASSWORD")
          }
        }
      }).catch(err=>console.log(err));
    }else{
      client.query(`SELECT * FROM business WHERE email = '${req.body.email}'`)
      .then(result=>{
        if (result.length == 0){
          res.send("NOT FOUND");
        }else{
          if (passwordHash.verify(req.body.password,result[0][0].password)){
            req.session.user = result[0][0];
            res.send(result[0][0]);
          }else{
            res.send("INCORRECT PASSWORD")
          }
        }
      }).catch(err=>console.log(err));
    }
  
});
router.post('/update-personal',auth.requireLogin,function(req,res,next){
  client.query("SELECT * FROM personal WHERE email = :email",
  {replacements:{email:req.session.user.email}})
  .then(result=>{
    if(passwordHash.verify(req.body.password,result[0][0].password)){
      var hashed;
      if (req.body.newpassword != ''){ hashed = passwordHash.generate(req.body.newpassword);}
      else{hashed = passwordHash.generate(req.body.password);} 
      client.query("UPDATE personal SET name=:name,password=:password,zipcode=:zipcode,city=:city,state=:state,photo=:photo WHERE email = :email RETURNING *",
      {replacements:{name:req.body.name,password:hashed,zipcode:req.body.zipcode,city:req.body.city,state:req.body.state,photo:req.body.photo,email:req.session.user.email}})
      .then(result=>{
        req.session.user = result[0][0];
        res.send(result[0][0]);
      })
      .catch(err=>console.log(err));
  }else{
    res.send("INCORRECT PASSWORD");
  }
}).catch(err=>res.status(400).send(err));
});
router.post('/update-business',auth.requireLogin,function(req,res,next){
  console.log(req.session.user);
  client.query("SELECT * FROM business WHERE email=:email",
  {replacements:{email:req.session.user.email}})
  .then(result=>{
    if(passwordHash.verify(req.body.password,result[0][0].password)){
      var hashed;
      if (req.body.newpassword != ''){ hashed = passwordHash.generate(req.body.newpassword);}
      else{hashed = passwordHash.generate(req.body.password);} 
      console.log(req.session.user.email);
      client.query("UPDATE business SET name=:name,password=:password,zipcode=:zipcode,website=:website,phone=:phone,address=:address,city=:city,state=:state,category1=:category1,category2=:category2,description=:description WHERE email=:email RETURNING *",
      {replacements:{name:req.body.name,password:hashed,zipcode:req.body.zipcode,website:req.body.website,phone:req.body.phone,address:req.body.address,city:req.body.city,state:req.body.state,category1:req.body.category1,category2:req.body.category2,description:req.body.description,email:req.session.user.email}})
      .then(result=>{
        req.session.user = result[0][0];
        res.send(result[0][0]);
      })
      .catch(err=>console.log(err));
  }else{
    res.send("INCORRECT PASSWORD");
  }
}).catch(err=>console.log(err));
});
router.post('/bookmark/:businessid',auth.requireLogin,function(req,res,next){
  let query = `UPDATE personal SET bookmarks = array_append(bookmarks,'${req.params.businessid}') WHERE id = '${req.session.user.id}' RETURNING *`
  client.query(query)
  .then(result=>{
    req.session.user = result[0][0];
    res.send(result[0][0]);
  }).catch(err=>console.log(err));
});
router.post('/deletebookmark',auth.requireLogin,function(req,res,next){
  let query = `UPDATE personal SET bookmarks = array_remove(bookmarks,'${req.body.businessid}') WHERE id = '${req.session.user.id}' RETURNING *`;
  client.query(query)
  .then(result=>{
    req.session.user = result[0][0];
    res.send(result[0][0]);
  }).catch(err=>console.log(err));
})

router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});
module.exports = router;
