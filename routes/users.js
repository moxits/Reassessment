var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
var currentClient = client.getClient();
var passwordHash = require('password-hash');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/registerPersonal',function(req,res){
    var hashed = passwordHash.generate(req.body.password);
    const query = {
      text: 'INSERT INTO personal(name,email,password) VALUES($1,$2,$3) RETURNING *',
      values: [req.body.name,req.body.email,hashed]
    }
    currentClient.query(query,(err,result)=> {
      if (err){
          console.log(err);
      }else{
        console.log("USER ID:",result.rows[0]);
      }
    });
});
router.post('/registerBusiness',function(req,res){
  var hashed = passwordHash.generate(req.body.password);
  const query = {
    text: 'INSERT INTO business(name,email,password) VALUES($1,$2,$3) RETURNING *',
    values: [req.body.name,req.body.email,hashed]
  }
  currentClient.query(query,(err,result)=> {
    if (err){
        console.log(err);
    }else{
      console.log("USER ID:",result.rows[0]);
    }
  });
});
module.exports = router;
