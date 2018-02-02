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
                client.query('CREATE TABLE IF NOT EXISTS personal(id SERIAL PRIMARY KEY, name VARCHAR(50), email VARCHAR(100), password VARCHAR(100))');
                client.query('CREATE TABLE IF NOT EXISTS business(id SERIAL PRIMARY KEY, name VARCHAR(50), email VARCHAR(100), password VARCHAR(100))');
            }
        });
    }
    //Get client
    this.getClient = function() {
        return client;
    }

    //Wipe database for testing
    this.truncate = function() {
        client.query('TRUNCATE users');
    }

    //Logout
    this.logout = function() {
        client.end();
    }
}

module.exports = currentClient;