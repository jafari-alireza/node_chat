var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

module.exports = function(ap) {
	passport.use(new LocalStrategy({
		emailFiled: 'email',
		passwordField: 'password'
	},
	function(email, password, done) {
		var user = {
			email: email,
			password: password
		};
		done(null, user);
	}));

};