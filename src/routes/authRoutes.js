var express = require('express');
var authRouter = express.Router();
var mysqlCon = require('../db/mysql');
var passport = require('passport');

function user_name_check(username) {
	var re = /^\w+$/;
	if (!re.test(username)) {
	    return false;
	}
	return true;
}
authRouter.route('/signup').post(function(req, res) {
	if(user_name_check(req.body.username)) {
		console.log('true');
	} else {
		console.log('false');
	}

	return;

	if(req.body.username.length === 0 || req.body.email.length === 0 || req.body.password.length === 0) {
				req.session.signup_message_fields = true;
				res.redirect('/signup');
				return;
	}  

	if(req.body.password.length !== req.body.password_confirmation.length) {
				req.session.signup_message_password_confirmation = true;
				res.redirect('/signup');
				return;
	} 

	mysqlCon.check_user_email(req.body.email, function(err, results) {
		if(results.length === 1) {
				req.session.signup_message = true;
				res.redirect('/signup');
		} else {
			mysqlCon.create_user(req.body.email, req.body.username, req.body.password, function(err, results) {
				if(results.affectedRows === 1) {
					req.login(results.insertId, function() {
						// send_email(req.body.email);
						res.redirect('/message');
					});
				}
			});
		}
	});
});

authRouter.route('/login').post(function(req, res) {
	mysqlCon.login_user(req.body.email, req.body.password, function(err, results) {
		if(results !== undefined && results.length === 1) {
			req.login(results[0].id, function() {
				req.session.logged_in = true;
				req.session.login_message = null;
				mysqlCon.notification_message_user_all_unread(req.user, function(err, unread) {
					req.session.unread_message = unread[0].total;
					// res.render('pages/message', {total_unread: unread[0].total});
					res.redirect('/message');
				});
			});
		} else {
			req.session.login_message = true;
			res.redirect('/login');
		}
	});
});


authRouter.route('/profile').all(function(req, res, next) {
	if(!req.user) {
		res.redirect('/');
	}
	
	next();
	}).get(function(req, res) {
	res.json(req.user);
});

module.exports = authRouter;