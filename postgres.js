var pg = require('pg');

var environment = process.env.NODE_ENV;
var connectionString = 'postgres://postgres:moxit1998@localhost:5432/ReviewRtest';


var currentClient = new function() {
    //Create a new instance of client
    var client = new pg.Client(connectionString);	

    //Establish connection with client
    this.connect = function() {
        client.connect((err)=> {
            if(!err){
                console.log('CLIENT CONNECTED TO: '+ connectionString);
                client.query('CREATE TABLE IF NOT EXISTS personal(id SERIAL PRIMARY KEY,type VARCHAR(50),name VARCHAR(50), email VARCHAR(100), password VARCHAR(100),zipcode INT,city VARCHAR(100),state VARCHAR(100))');
                client.query('CREATE TABLE IF NOT EXISTS business(id SERIAL PRIMARY KEY,type VARCHAR(50),name VARCHAR(50),email VARCHAR(50),password VARCHAR(100),zipcode INT,city VARCHAR(100),state VARCHAR(100),addresss VARCHAR(100),phone VARCHAR(20),website VARCHAR(50),description VARCHAR(10000))');
            }
        });
    }
    //Get client
    this.getClient = function() {
        return client;
    }

    //Wipe database for testing
    this.truncate = function() {
        client.query('TRUNCATE personal');
        client.query('TRUNCATE business')
    }

    //Logout
    this.logout = function() {
        client.end();
    }
}

module.exports = currentClient;