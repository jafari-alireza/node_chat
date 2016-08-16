var express = require('express');
var messageRouter = express.Router();
var mysqlCon = require('../../src/db/mysql');
var moment = require('moment');
/*****************************/ 
var details = [];
var contact_infos = [];
var info = [];
var totals = [];
var new_messages = [];
/*****************************/ 
var senders = [];
var messages = [];
var dates = [];
var seens = [];
/*****************************/ 
messageRouter.use(function(req, res, next) {
	if(!req.user) {
		res.redirect('/login');
	}

	next();
});

function save(val, array) {
	array.push(val);
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
	mysqlCon.hashedId_distinct(req.user, function(err, hashed_id) {
		if(hashed_id.length !== 0) {
			contact_infos = [];
			details = [];
			totals = [];
			new_messages = [];

			mysqlCon.notification_message_user_all_unread(req.user, function(err, unread) {
				req.session.unread_message = unread[0].total;
			});

			mysqlCon.allMessage_count(hashed_id, function(err, total) {
				for (var i = 0; i < total.length; i++) {
					save(total[i], totals);
				}
			});

			mysqlCon.notification_message_user_all_unread_detail(req.user, hashed_id, function(err, new_message) {
				for (var i = 0; i < new_message.length; i++) {
					save(new_message[i], new_messages);
				}
			});

			mysqlCon.lastMessage(hashed_id, function(err, message) {
				message = message.filter(function(n) {return n.length !== 0});
				if(hashed_id.length === 1) {
					for (var i = 0; i < message.length; i++) {
						moment.locale('fa');
						var time_laps = moment(message[i].created_at).fromNow();
						var m = {
									session_id: message[i].session_id,
								    message: remove_white_spaces(message[i].message),
								    time_laps: time_laps   
								}

						save(m, details);
						var sender = "";
						var reciver = "";
						if(message[i].user_id === req.user) {
							sender = [
								message[i].user_id 
							]

							reciver = [
								message[i].contact_id
							]

							info = [];
							info.push(sender);
							info.push(reciver);
						} else {
							sender = [
								message[i].user_id
							]

							reciver = [
								message[i].user_id
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

							save(m, contact_infos);
							if(contact_infos.length === message.length) {
								res.render('pages/message', {logged_in: true, m: details, contact_info: contact_infos, total: totals, new_message: new_messages, total_unread: req.session.unread_message, contact_id: req.user});
							}
						});
					}
				}
				else {
					for (var i = 0; i < message.length; i++) {
						moment.locale('fa');
						var time_laps = moment(message[i][0].created_at).fromNow();
						var m = {
									session_id: message[i][0].session_id,
								    message: remove_white_spaces(message[i][0].message),
								    time_laps: time_laps   
								}

						save(m, details);
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

							save(m, contact_infos);
							if(contact_infos.length === message.length) {
								res.render('pages/message', {logged_in: true, m: details, contact_info: contact_infos, total: totals, new_message: new_messages, total_unread: req.session.unread_message, contact_id: req.user});
							}
						});
					}	
				}						
			});
		} else {
			res.render('pages/message', {logged_in: true, m: ''});
		}
	});
});

messageRouter.route('/to/:id').get(function(req, res) {
	var id = req.params.id;
	messages = [];
	senders = [];
	dates = [];
	seens = [];

	mysqlCon.notification_update(req.user, id, function(error, update_seen_at) {
		if(update_seen_at.affectedRows > 0) {
			mysqlCon.notification_message_user_all_unread(req.user, function(err, unread) {
				req.session.unread_message = unread[0].total;
			});
		}
	});

	mysqlCon.allMessage(id, function(error, message) {
		for (var i = 0; i < message.length; i++) {
			moment.locale('fa');
			var time_laps = moment(message[i].created_at).fromNow();
			if(message[i].user_id !== req.user) {
				if(message[i].seen_at !== null) {
					var seen = moment(message[i].seen_at).fromNow();
					save(seen, seens);
				} else {
					save("هنوز دیده نشده", seens);
				}
			} else {
				save("", seens);
			}

			save(time_laps, dates);
			save(message[i].message, messages);

			mysqlCon.user_name(message[i].user_id, function(error, sender) {
				save(sender[0].user_name, senders);
				if(senders.length === messages.length) {
					res.render('pages/send_message', {logged_in: true, message: messages, sender: senders, date: dates, seen: seens, session_id: id, total_unread: req.session.unread_message});
				}
			});
		}
	});
});

messageRouter.route('/to/:id').post(function(req, res) {
	var session_id = req.body.id;
	var message = req.body.message;
	var reciver = 0;
	var sender = 0;
	mysqlCon.session_users(session_id, function(error, contact) {
		if(req.user !== contact[0].reciver) {
			reciver = contact[0].reciver;
			sender = contact[0].sender;
		} else {
			reciver = contact[0].sender;
			sender = contact[0].reciver;
		}

		mysqlCon.insertMessage(message, session_id, sender, reciver, function(error, save_message) {
			if(save_message.affectedRows === 1) {

				mysqlCon.notification_message_user_all_unread_detailed(reciver, session_id, function(error, unread_message_detailed) {
					if(unread_message_detailed) {
						mysqlCon.notification_message_user_all_unread(reciver, function(err, unread) {
							req.session.unread_message = unread[0].total;
							mysqlCon.user_name(sender, function(error, username) {
								moment.locale('fa');
								var now = moment();
								var time_laps = moment(now).fromNow();
								var data = {
									username: username[0].user_name,
									message: message,
									time: time_laps,
									contact_id: reciver,
									unread_message: unread[0].total,
									unread_message_detailed: unread_message_detailed[0].total,
									session_id: session_id,
								}

								res.send(data);
							});
						});
					}
				});
			}
		});
	});
});

module.exports = messageRouter;