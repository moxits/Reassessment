var express = require('express');
var router = express.Router();
var client = require('../postgres.js');
var axios = require('axios');
//var currentClient = client.getClient();
var passwordHash = require('password-hash');
var auth = require('../utils/auth');
/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.user){
    client.query("SELECT * FROM business ORDER BY id DESC LIMIT 3")
    .then(result=>{
      res.render('index', { title: 'Express',user:'none',newbusiness:result[0]});
    });
  }else{
    client.query("SELECT * FROM business ORDER BY id DESC LIMIT 3")
    .then(result=>{
      res.render('index', { title: 'Express',user:req.session.user,newbusiness:result[0]});
    });
  }
});
router.get('/populate',function(req,res,next){
  var index = 0;
  const businessnames = [
    'GameStop','Whole Foods','Apple','Walgreens','Stacks','King Almond','Nike','Adidas','Chipotle','Taco Bell'
  ]
  const randomZip = [94536,92617,92697]
  const randomCity = ['Fremont','Irvine','Los Angeles','Tustin']
  const randomCategory = ['Food','Sports','Lunch','Breakfast','Electronics']
  const randomAddress = ['63634 Arroyo Drive','38453 Garway Drive','4001 Mesa Road']
  const randomDescription = ['This is sports retailer','This is a fast food chain',
'This is breakfast food','This is an electronics retailer']
  const randomPhoto = [
    'https://cdn.thesolesupplier.co.uk/2017/08/NIKE-Logo.jpg',
    'http://static.businessinsider.com/image/526e70dbecad040247237811-750.jpg',
    'https://images-na.ssl-images-amazon.com/images/I/61%2B5oOddGTL.png'
  ]
  axios.get('https://randomuser.me/api/?inc=login,email&results=10')
  .then(response=>{
    response.data.results.forEach(function(userInfo){
      let name = businessnames[index];
      let zip = randomZip[Math.floor(Math.random() * randomZip.length)];
      let city = randomCity[Math.floor(Math.random() * randomCity.length)];
      let cat1 = randomCategory[Math.floor(Math.random() * randomCategory.length)];
      let cat2 = randomCategory[Math.floor(Math.random() * randomCategory.length)];
      let address = randomAddress[Math.floor(Math.random() * randomAddress.length)];
      let description = randomDescription[Math.floor(Math.random() * randomDescription.length)];
      let photo = randomPhoto[Math.floor(Math.random() * randomPhoto.length)];
      index++;
      client.query(`INSERT INTO business(type,name,email,password,zipcode,city,category1,category2,address,state,description,photo,phone,website) VALUES('business','${name}','${userInfo.email}','test','${zip}','${city}','${cat1}','${cat2}','${address}','CA','${description}','${photo}','(510)305-1843','google.com')`)
      .catch(err=>console.log(err));
    })
    if (!req.session.user){
      client.query("SELECT * FROM business ORDER BY id DESC LIMIT 3")
      .then(result=>{
        res.render('index', { title: 'Express',user:'none',newbusiness:result[0]});
      }).catch(err=>console.log(err));
    }else{
      client.query("SELECT * FROM business ORDER BY id DESC LIMIT 3")
      .then(result=>{
        res.render('index', { title: 'Express',user:req.session.user,newbusiness:result[0]});
      }).catch(err=>console.log(err));
    }
  })
})
router.get('/viewbookmarks',auth.requireLogin,function(req,res,next){
  if (req.session.user.type == 'personal'){
    if (req.session.user.bookmarks.length != 0){
      client.query(`SELECT * FROM business WHERE ARRAY[id] <@ ARRAY[${req.session.user.bookmarks}]`)
      .then(result=>{
        res.render('bookmarks', { title: 'Express',user:req.session.user,newbusiness:result[0]});
      }).catch(err=>console.log(err));
    }else{
      res.render('bookmarks',{title:'Express',user:req.session.user,newbusiness:[]});
    }
  }else{
    client.query("SELECT * FROM business ORDER BY id DESC LIMIT 3")
      .then(result=>{
        res.render('index', { title: 'Express',user:req.session.user,newbusiness:result[0]});
    }).catch(err=>console.log(err));
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
  if (req.session.user.type == 'business'){
    client.query(`SELECT * FROM reviews WHERE business = '${req.session.user.id}'`)
    .then(result=>{
      res.render('businessprofile',{user:req.session.user,reviews:result[0]});
    }).catch(err=>console.log(err));
  }else{
    client.query(`SELECT * FROM reviews WHERE userid = '${req.session.user.id}'`)
    .then(result=>{
      res.render('personalprofile',{user:req.session.user,reviews:result[0]});
    }).catch(err=>console.log(err));
  }
});
router.get('/business',auth.requireLogin,function(req,res,next){
  if (req.session.user.type == 'personal'){
    client.query(`SELECT * FROM reviews WHERE personal = '${req.session.user.id}'`)
    .then(result=>{
      res.render('personalprofile',{user:req.session.user,reviews:result[0]});
    }).catch(err=>console.log(err));
  }else{
  client.query(`SELECT * FROM reviews WHERE business = '${req.session.user.id}'`)
  .then(result=>{
    res.render('businessprofile',{user:req.session.user,reviews:result[0]});
  }).catch(err=>console.log(err));
}
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
  var bookmarked = 'Bookmark';
  client.query("SELECT * FROM business WHERE id = :id",
  {replacements:{id:req.params.id}})
  .then(result=>{
    var user = result[0][0];
    client.query(`SELECT * FROM reviews WHERE business = '${req.params.id}'`)
    .then(result=>{
      if (!req.session.user){
        type == 'personal';
        login = "false";
      }else{
        login = "true";
        if (req.session.user.type == 'personal'){
          if (req.session.user.bookmarks.includes(parseInt(req.params.id))){
            bookmarked = 'Remove Bookmark';
          }
          type ='personal';
        }else{
          type='business';
        }
      }
      console.log(bookmarked);
      res.render('viewbusiness',{login:login,bookmarked:bookmarked,user:user,type:type,reviews:result[0]});
    }).catch(err=>console.log(err))
  }).catch(err=>res.status(400).send(err));
 
});
router.get('/view-personal/:id',function(req,res,next){
  if (req.session.user){
    if(req.session.user.id == req.params.id){
      client.query(`SELECT * FROM reviews WHERE userid = '${req.session.user.id}'`)
      .then(result=>{
      res.render('personalprofile',{user:req.session.user,reviews:result[0]});
      }).catch(err=>console.log(err));
    }
  }
  var login;
  if (!req.session.user){
    login = "false";
  }else{
    login = "true";
  }
  client.query(`SELECT * FROM personal WHERE id = '${req.params.id}'`)
  .then(result=>{
    var user = result[0][0];
    client.query(`SELECT * FROM reviews WHERE userid = '${req.params.id}'`)
    .then(result=>{
      res.render('viewpersonal',{login:login,user:user,reviews:result[0]});
    }).catch(err=>console.log(err));
  }).catch(err=>console.log(err));
});
router.get('/search/:searchterm',function(req,res,next){
  var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%' OR category1 ILIKE '%test1%' OR category2 ILIKE '%$test2%'`;
  client.query(query)
  .then(result=>{
    if (!req.session.user){
        res.render('searchresults', { title: 'Express',user:'none',newbusiness:result[0]});
    }else{
        res.render('searchresults', { title: 'Express',user:req.session.user,newbusiness:result[0]});
    }
  }).catch(err=>console.log(err));
});
router.get('/search/:searchterm/:location',function(req,res,next){
  var toreturn = [];
  if (req.body.location != undefined){
    var city = req.body.location.split(",")[0];
    var state = req.body.location.split(",")[1];
    if (state != undefined){
      var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%' OR category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}' AND city ILIKE '%${city}%' AND state ILIKE '%${state}%'`;
    }else{
      if (req.body.location.length < 3){
        var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%' OR category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}' AND state ILIKE '%${city}%'`
      }else{
        var query = `SELECT * FROM business WHERE name ILIKE '%${req.params.searchterm}%' OR category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}' AND city ILIKE '%${city}%'`
      }
    }
  }else{
    var query = `SELECT * FROM business WHERE category1 ILIKE '%${req.params.searchterm}%' OR category2 ILIKE '%${req.params.searchterm}'`;
  }
  client.query(query)
  .then(result=>{
    toreturn = toreturn.concat()
    if (!req.session.user){
        res.render('searchresults', { title: 'Express',user:'none',newbusiness:result[0]});
    }else{ 
        res.render('searchresults', { title: 'Express',user:req.session.user,newbusiness:result[0]});
    }
  }).catch(err=>console.log(err));
});
module.exports = router;
