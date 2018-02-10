var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
var currentClient = client.getClient();
var passwordHash = require('password-hash');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/register',function(req,res){
    var hashed = passwordHash.generate(req.body.password);
    var query;
    if (req.body.type == "Personal"){
    query = {
      text: 'INSERT INTO personal(type,name,email,password) VALUES($1,$2,$3,$4) RETURNING *',
      values: [req.body.type,req.body.name,req.body.email,hashed]
      }
    }else{
      query = {
        text: 'INSERT INTO business(type,name,email,password) VALUES($1,$2,$3,$4) RETURNING *',
        values: [req.body.type,req.body.name,req.body.email,hashed]
        }
    }
    currentClient.query(query,(err,result)=> {
      if (err){
          console.log(err);
      }else{
        req.session.user = result.rows[0];
        res.send(result[0]);
      }
    });
});
router.post('/login',function(req,res,next){
    var query;
    if (req.body.type == 'Personal'){
      query = {
        text: 'SELECT * FROM personal WHERE email = $1',
        values: [req.body.email]
      }
    }else{
      query = {
        text: 'SELECT * FROM business WHERE email = $1',
        values:[req.body.email]
      }
    }
    currentClient.query(query,(err,result)=>{
      console.log(result);
      if (err){
        console.log(err);
      }else{
        if (result.rows.length === 0){
          res.send("NOT FOUND");
        }
        else{
          if (passwordHash.verify(req.body.password,result.rows[0].password))
          {
            req.session.user = result.rows[0];
            if (result.rows[0].type == 'Personal'){
              console.log("here");
              res.redirect("/personal-profile");
            }else{
              res.redirect("/business-profile");
            }
          }
          else{
            res.send("INCORRECT PASSWORD");
          }
        }
      }
    });
});
router.post('/update-personal',function(req,res,next){
  const query1 = {
    text: 'SELECT * FROM personal WHERE email = $1',
    values: [req.session.user.email]
  }
  currentClient.query(query1,(err,result)=>{
    if(err){console.log(err);}
    if (passwordHash.verify(req.body.password,result.rows[0].password)){
      console.log(result.rows[0]);
    var hashed;
    if (req.body.newpassword != ''){ hashed = passwordHash.generate(req.body.newpassword);}
    else{hashed = passwordHash.generate(req.body.password);}
    const query2 = {
      text: 'UPDATE personal SET name = $1,email=$2,password=$3,zipcode=$4,city=$5,state=$6 WHERE email=$7',
      values:[req.body.name,req.body.email,hashed,req.body.zipcode,req.body.city,req.body.state,req.session.user.email]
    }
    currentClient.query(query2,(err,result)=>{
        if (err) {console.log(error);}
        else{
          req.session.user = result.rows[0];
          res.send("SUCCESS");
        }
    })
    }
    })
});
router.post('/update-business',function(req,res,next){
  const query1 = {
    text: 'SELECT * FROM business WHERE email = $1',
    values: [req.session.user.email]
  }
  currentClient.query(query1,(err,result)=>{
    if (err) {console.log(err);}
    if (passwordHash.verify(req.body.password,result.rows[0].password)){
      var hashed;
      if (req.body.newpassword != ''){hashed = passwordHash.generate(req.body.newpassword);}
      else{hashed = passwordHash.generate(req.body.password);}
      const query2 = {
        text: 'UPDATE business SET name=$1,email=$2,password=$3,zipcode=$4,city=$5,state=$6,address=$7,description=$8,phone=$9,website=$10 WHERE email=$11',
        values:[req.body.name,req.body.email,req.body.password,req.body.zipcode,req.body.city,req.body.address,req.body.description,req.body.phone,req.body.website,req.session.user.email]
      }
      currentClient.query(query2,(err,result)=>{
        if(err){console.log(err);}
        else{
          req.session.user=result.rows[0];
          res.send("SUCCESS");
        }
    })
  }
})
});
module.exports = router;
