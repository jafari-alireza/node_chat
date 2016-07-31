var express = require('express');
var homeRouter = express.Router();

homeRouter.use(function(req, res, next) {
	if(!req.user) {
		res.redirect('/login');
	}

	next();
});

homeRouter.route('/').get(function(req, res) {
	res.render('pages/index', {logged_in: true}); 	
});


module.exports = homeRouter;

