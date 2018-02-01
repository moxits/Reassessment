const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres', 'postgres', 'moxit1998', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 9,
    min: 0,
    idle: 10000
  }
});

sequelize.authenticate().then(() => {
  console.log("Success!");
  var Posts = sequelize.define('posts', {
    title: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.STRING
    }
  }, {
    freezeTableName: true
  });

  Posts.sync({force: true}).then(function () {
    return Posts.create({
      title: 'Getting Started with PostgreSQL and Sequelize',
      content: 'Hello there'
    });
  });
  Posts.findAll({}).then((data) => {
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
}).catch((err) => {
  console.log(err);
});
