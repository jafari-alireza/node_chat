var express = require('express');
var loginRouter = express.Router();

loginRouter.use(function(req, res, next) {
	if(req.user) {
		res.redirect('/message');
	}

	next();
	
});

loginRouter.route('/').get(function(req, res) {
	if(req.session.login_message) {
	 	req.session.login_message = null;
		res.render('pages/login', {login_message: true});
	} else {
 	 	req.session.login_message = null;
 	 	res.render('pages/login');
	}
	
});


module.exports = loginRouter;