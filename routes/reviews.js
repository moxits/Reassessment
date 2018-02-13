var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
//var currentClient = client.getClient();
var passwordHash = require('password-hash');
var auth = require('../utils/auth');

router.post('/newreview',function(req,res,next){
    const query1 = {
        text: 'INSERT INTO reviews(user,business,date,content,rating) VALUES ($1,$2,CURRENT_DATE,$3,$4) RETURNING *',
        values: [req.body.userid,req.body,businessid,req.body.content,req.body.rating]
    }
    currentClient.query(query,(err,result)=>{
        if (err) {console.log(err);}
        else{
            res.send(result[0]);
        }
    })
});