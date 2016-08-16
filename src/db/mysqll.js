var mysql = require("mysql");
var cryptoJS = require("crypto-js");
var moment = require('moment');

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'node_chat'
  },
  pool: {
    min: 0,
    max: 7
  }
});




// create new user
exports.login_user = function(email, password, callback) {
	var hashed_password = cryptoJS.SHA256(password, (new Date()).valueOf().toString()).toString();
	knex.select('id').from('users')
	  .where('email', '=', email)
	  .andWhere('password', '=', hashed_password)
	  .limit(1)
	  .then(function(rows) {
	    callback(false, rows);
	  })
	  .catch(function(error) {
	    console.error(error)
	  });
};
