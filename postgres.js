const Sequelize = require('sequelize');
var pg = require('pg');
const sequelize = new Sequelize('postgres://postgres:moxit1998@localhost:5432/ReviewRtest');

var environment = process.env.NODE_ENV;
var connectionString = 'postgres://postgres:moxit1998@localhost:5432/ReviewRtest';
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');  
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
sequelize.query('CREATE TABLE IF NOT EXISTS personal(id SERIAL PRIMARY KEY,type VARCHAR(50),name VARCHAR(50), email VARCHAR(100), password VARCHAR(100),zipcode INT,city VARCHAR(100),state VARCHAR(100),numreviews INT DEFAULT 0,bookmarks INT[])');
sequelize.query('CREATE TABLE IF NOT EXISTS business(id SERIAL PRIMARY KEY,type VARCHAR(50),name VARCHAR(50),email VARCHAR(50),password VARCHAR(100),zipcode INT,city VARCHAR(100),state VARCHAR(100),address VARCHAR(100),phone VARCHAR(20),website VARCHAR(50),description VARCHAR(10000),category1 VARCHAR(100),category2 VARCHAR(100),rating INT DEFAULT 0,numreviews INT DEFAULT 0,reviews INT[])')
sequelize.query('CREATE TABLE IF NOT EXISTS reviews(id SERIAL PRIMARY KEY,userid VARCHAR(50),day DATE,business VARCHAR(50),content VARCHAR(10000),rating INT)');


module.exports =sequelize;