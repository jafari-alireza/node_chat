var express = require('express');
var messageRouter = express.Router();
var mysqlCon = require('../../src/db/mysql');
var moment = require('moment');
var details = [];
var contact_infos = [];
var info = [];
var totals = [];
var new_messages = [];

messageRouter.use(function(req, res, next) {
	if(!req.user) {
		res.redirect('/login');
	}

	next();
});

function save_details(val, element_name) {
	// if(typeof(element_name) !== 'undefined' && element_name.length !== 0) {
	details.push(val);
}

function save_contact_infos(val, element_name) {
	// if(typeof(element_name) !== 'undefined' && element_name.length !== 0) {
	contact_infos.push(val);
}

function save_total(val, element_name) {
	// if(typeof(element_name) !== 'undefined' && element_name.length !== 0) {
	totals.push(val);
}

function save_new_message(val, element_name) {
	// if(typeof(element_name) !== 'undefined' && element_name.length !== 0) {
	new_messages.push(val);
}

function remove_white_spaces (str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

messageRouter.route('/').get(function(req, res) {
	mysqlCon.hashedId_distinct(req.user, function(err, results) {
		if(results.length !== 0) {
			contact_infos = [];
			details = [];
			totals = [];
			new_messages = [];

			mysqlCon.allMessage_count(results, function(err, total) {
				for (var i = 0; i < total.length; i++) {
					save_total(total[i]);
				}
			});

			mysqlCon.notification_message_user_all_unread_detail(req.user, results, function(err, new_message) {
				for (var i = 0; i < new_message.length; i++) {
					save_new_message(new_message[i]);
				}
			});

			mysqlCon.lastMessage(results, function(err, message) {
				for (var i = 0; i < message.length; i++) {
					moment.locale('fa');
					var time_laps = moment(message[i][0].created_at).fromNow();
					message[i][0].time_laps = time_laps;
					var m = {
								id: message[i][0].id,
							    content: remove_white_spaces(message[i][0].message),
							    time: time_laps   
							}				

					save_details(m);
					var sender = "";
					var reciver = "";
					if(message[i][0].user_id === req.user) {
						sender = [
							message[i][0].user_id 
						]

						reciver = [
							message[i][0].contact_id
						]

						info = [];
						info.push(sender);
						info.push(reciver);
					} else {
						sender = [
							message[i][0].user_id
						]

						reciver = [
							message[i][0].user_id
						]

						info = [];
						info.push(sender);
						info.push(reciver);
					}

					mysqlCon.contact_info(info, function(err, contact_info) {
						var m = {
							sender: contact_info[0][0].user_name,
							reciever: contact_info[1][0].user_name
						}

						save_contact_infos(m);
						if(contact_infos.length === message.length) {
							res.render('pages/message', {logged_in: true, m: message, contact_info: contact_infos, total: totals, new_message: new_messages});
						}
					});
				}
			});
		} else {
			res.render('pages/message', {logged_in: true, m: ''});
		}
	});
});

messageRouter.route('/:id').get(function(req, res) {
	var id = req.params.id;
	res.send('hello my number ' + id + ' friend');
});

module.exports = messageRouter;