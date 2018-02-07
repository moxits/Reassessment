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
    const query = {
      text: 'INSERT INTO users(type,name,email,password) VALUES($1,$2,$3,$4) RETURNING *',
      values: [req.body.type,req.body.name,req.body.email,hashed]
    }
    currentClient.query(query,(err,result)=> {
      if (err){
          console.log(err);
      }else{
        console.log("USER ID:",result.rows[0]);
      }
    });
});
router.post('/login',function(req,res,next){
    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [req.body.email]
    }
    currentClient.query(query,(err,result)=>{
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
            res.redirect("/personal-profile");
            //res.render("/personal-profile",{user:result.rows[0]});
          }
          else{
            res.send("INCORRECT PASSWORD");
          }
        }
      }
    });
});
module.exports = router;
