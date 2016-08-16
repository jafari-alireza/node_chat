var express = require('express');
var signinRouter = express.Router();

signinRouter.use(function(req, res, next) {
	if(req.user) {
		res.redirect('/message');
	}

	next();
});

signinRouter.route('/').get(function(req, res) {
	if(req.session.signup_message) {
	 	req.session.signup_message = null;
	 	message = "این آدرس ایمیل هم اکنون موجود است."
   		res.render('pages/signup', {signup_message: true, m: message});
 	} else if(req.session.signup_message_fields) {
	 	req.session.signup_message_fields = null;
	 	message = "تمام فیلد ها ره پر کنید."
   		res.render('pages/signup', {signup_message: true, m: message});
 	} else if(req.session.signup_message_password_confirmation) {
	 	req.session.signup_message_password_confirmation = null;
	 	message = "پسوورد ها با هم مطابقت ندارند."
   		res.render('pages/signup', {signup_message: true, m: message});
 	} else {
 	 	req.session.signup_message = null;
 	 	res.render('pages/signup');
 	}
});


module.exports = signinRouter;