var client = require('../postgres.js');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should(); 
chai.use(chaiHttp);
var path, postid, userid;
var passwordHash = require('password-hash');
var http = require('http');
var app = require('../app');
var port = process.env.PORT || '3010';
app.set('port', port);
var server = http.createServer(app);
var agent = chai.request.agent(server);



describe('Home Page Get Functions',function(){
    it('Should render the homepage (index) with a GET request',function(done){
        chai.request(server)
            .get('/')
            .end(function(err,res){
                res.should.have.status(200);
                done();
            })
    })
    it ('Should render the login page with a GET request',function(done){
        chai.request(server)
        .get('/login-page')
        .end(function(err,res){
            res.should.have.status(200);
            done();
        })
    })
    it ('Should render the signup page with a GET request',function(done){
        chai.request(server)
        .get('/signup-page')
        .end(function(err,res){
            res.should.have.status(200);
            done();
        })
    })
});
describe('Register Functions',function(){
    before(function(done) {
        client.query('TRUNCATE personal');
        client.query('TRUNCATE business');
        client.query('ALTER SEQUENCE personal_id_seq RESTART');
        client.query('ALTER SEQUENCE business_id_seq RESTART');
        done();
      });
    it('Should register a new unique user to the personal table',function(done){
        chai.request(server)
        .post('/users/register')
        .send({'type':'personal','name':'Moxit Shah','email':'moxits@uci.edu','password':'test'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.name.should.equal('Moxit Shah');
            res.body.type.should.equal('personal');
            done();
        })
    })
    it('Should register a new unique user to the business table',function(done){
        chai.request(server)
        .post('/users/register')
        .send({'type':'business','name':"Moxit's Shop",'email':'test@test.com','password':'test'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.name.should.equal("Moxit's Shop");
            res.body.type.should.equal('business');
            done();
        })
    })
    it ('Should not register a new user because the email is not unique',function(done){
        chai.request(server)
        .post('/users/register')
        .send({'type':'business','name':'MFST','email':'test@test.com','password':'test'})
        .end(function(err,res){
            res.should.have.status(200);
            nll = res.body;
            res.body.should.deep.equal({});
            done();
        })
    })

})
describe('Login Functions',function(){
    it('Should not login because user was not found',function(done){
        agent.post('/users/login')
        .send({'type':'personal','name':'test','email':'doesntexist','password':'test'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.should.deep.equal({});
            done();
        })
    })
    it('Should not login because incorrect password',function(done){
        agent.post('/users/login')
        .send({'type':'personal','email':'moxits@uci.edu','password':'notcorrect'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.should.deep.equal({});
            done();
        })
    })
    it('Logins in the user from the personal table and checks the session user',function(done){
        agent.post('/users/login')
        .send({'type':'personal','email':'moxits@uci.edu','password':'test'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.name.should.equal('Moxit Shah');
            res.body.type.should.equal('personal');
            res.body.bookmarks.should.deep.equal([]);
            done();
        })
    })
    it('Logins in the user from the business table and checks the session user',function(done){
        agent.post('/users/login')
        .send({'type':'business','email':'test@test.com','password':'test'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.name.should.equal("Moxit's Shop");
            res.body.type.should.equal('business');
            res.body.email.should.equal('test@test.com');
            done();
        })
    })
})
describe('Update Functions',function(){
    it('Does not allow update for personal user because wrong password was entered',function(done){
        var updates ={
            name:'updated name',
            email:'moxits@uci.edu',
            password:'notcorrect',
            zipcode:12345,
            city:'Fremont',
            photo:'http://jennstrends.com/wp-content/uploads/2013/10/bad-profile-pic-2.jpeg',
            state:'CA',
        }
        agent.post('/users/login')
            .send({"type":'personal','email':'moxits@uci.edu','password':'test'})
            .then(function(res){
                agent.post('/users/update-personal')
                .send(updates)
                .end(function(err,res){
                    res.should.have.status(200);
                    res.body.should.deep.equal({});
                    done();
                })
        })
    })
    it('Updates personal user',function(done){
        var updates = {
            'name':'updated name',
            'email':'moxits@uci.edu',
            'newpassword':'',
            'password':'test',
            'zipcode':12345,
            photo:'http://jennstrends.com/wp-content/uploads/2013/10/bad-profile-pic-2.jpeg',
            'city':'Fremont',
            'state':'CA',
        }
        agent.post('/users/login')
            .send({"type":'personal','email':'moxits@uci.edu','password':'test'})
            .then(function(res){
                agent.post('/users/update-personal')
                .send(updates)
                .end(function(err,res){
                    res.should.have.status(200);
                    res.body.name.should.equal('updated name');
                    res.body.state.should.equal('CA');
                    res.body.city.should.equal('Fremont');
                    done();
                })
            })
    })
    it('Does not allow update for business user because wrong password was entered',function(done){
        var updates ={
            name:'updated name',
            email:'test@test.com',
            newpassword:'',
            password:'notcorrect',
            zipcode:12345,
            city:'Fremont',
            state:'CA',
            website:'test.com',
            phone:'(510)305-1843',
            address:'38453 Garway Drive',
            category1:'Food',
            category2:'Plates',
            photo:'http://jennstrends.com/wp-content/uploads/2013/10/bad-profile-pic-2.jpeg',
            description:'Food Business',
        }
        agent.post('/users/login')
            .send({"type":'business','email':'test@test.com','password':'test'})
            .then(function(res){
                agent.post('/users/update-business')
                .send(updates)
                .end(function(err,res){
                    res.should.have.status(200);
                    res.body.should.deep.equal({});
                    done();
                })
            })
    })
    it('Updates Business',function(done){
        var updates ={
            name:'updated name',
            email:'test@test.com',
            newpassword:'',
            password:'test',
            zipcode:12345,
            city:'Fremont',
            state:'CA',
            website:'test.com',
            phone:'(510)305-1843',
            address:'38453 Garway Drive',
            category1:'Food',
            category2:'Plates',
            description:'Food Business',
            photo:'http://jennstrends.com/wp-content/uploads/2013/10/bad-profile-pic-2.jpeg'
        }
        agent.post('/users/login')
            .send({"type":'business','email':'test@test.com','password':'test'})
            .then(function(res){
                agent.post('/users/update-business')
                .send(updates)
                .end(function(err,res){
                    res.should.have.status(200);
                    res.body.category1.should.equal('Food');
                    res.body.description.should.equal('Food Business');
                    res.body.phone.should.equal('(510)305-1843');
                    done();
                })
            })
    })
    it('Updates Business with new password',function(done){
        var updates ={
            name:'updated name',
            email:'test@test.com',
            newpassword:'newpassword',
            password:'test',
            zipcode:12345,
            city:'Fremont',
            state:'CA',
            website:'test.com',
            phone:'(510)305-1843',
            address:'38453 Garway Drive',
            category1:'Food',
            category2:'Plates',
            description:'Food Business',
            photo:'http://jennstrends.com/wp-content/uploads/2013/10/bad-profile-pic-2.jpeg'
        }
        agent.post('/users/login')
            .send({"type":'business','email':'test@test.com','password':'test'})
            .then(function(res){
                agent.post('/users/update-business')
                .send(updates)
                .end(function(err,res){
                    res.should.have.status(200);
                    res.body.category1.should.equal('Food');
                    res.body.description.should.equal('Food Business');
                    res.body.phone.should.equal('(510)305-1843');
                    done();
                })
            })
    })
    it('Verifies the password change',function(done){
        agent.post('/users/login')
        .send({'type':'business','email':'test@test.com','password':'newpassword'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.name.should.equal("updated name");
            res.body.type.should.equal('business');
            res.body.email.should.equal('test@test.com');
            done();
        })
    })
})
describe('Bookmark Functions',function(){
    it('Adds a bookmark to the user profile',function(done){
        agent.post('/users/login')
        .send({"type":'personal','email':'moxits@uci.edu','password':'test'})
        .then(function(res){
            agent.post('/users/bookmark/1')
            .end(function(err,res){
                res.should.have.status(200);
                res.body.bookmarks.length.should.equal(1);
                res.body.bookmarks.should.deep.equal([1]);
                done();
            })
        })
    })
    
    it('Removes a bookmark from the user profile',function(done){
        agent.post('/users/deletebookmark')
        .send({'businessid':'1'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.name.should.equal("updated name");
            res.body.bookmarks.length.should.equal(0);
            res.body.bookmarks.should.deep.equal([]);
            done();
        })
    })
})
describe('Review Test',function(){
    after(function(done){
        client.query('TRUNCATE personal');
        client.query('TRUNCATE business');
        client.query('TRUNCATE reviews');
        client.query('ALTER SEQUENCE reviews_id_seq RESTART');
        client.query('ALTER SEQUENCE personal_id_seq RESTART');
        client.query('ALTER SEQUENCE business_id_seq RESTART');
        done();
    })
    it('Writes A Review',function(done){
        review = {
            businessid:1,
            content:'Terrible Review',
            rating:1,
        }
        agent.post('/users/newreview')
        .send(review)
        .end(function(err,res){
            res.should.have.status(200);
            res.body.userid.should.equal('1');
            res.body.content.should.equal("Terrible Review");
            res.body.rating.should.equal(1);
            res.body.business.should.equal('1');
            done();
        })
    })
    it('Writes A Second Review',function(done){
        review = {
            businessid:1,
            content:'Great Review',
            rating:5,
        }
        agent.post('/users/newreview')
        .send(review)
        .end(function(err,res){
            res.should.have.status(200);
            res.body.userid.should.equal('1');
            res.body.content.should.equal("Great Review");
            res.body.rating.should.equal(5);
            res.body.business.should.equal('1');
            done();
        })
    })
    it('Checks if user profile number of reviews increased',function(done){
        agent.post('/users/login')
        .send({'type':'personal','email':'moxits@uci.edu','password':'test'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.name.should.equal('updated name');
            res.body.numreviews.should.equal(2);
            done();
        })
    })
    it('Checks if business profile was updated to reflect the review',function(){
        agent.post('/users/login')
        .send({'type':'business','email':'test@test.com','password':'newpassword'})
        .end(function(err,res){
            res.should.have.status(200);
            res.body.email.should.equal('test@test.com');
            res.body.rating.should.equal(3);
            res.body.numreviews.should.equal(2);
            done();
        })
    })
})
