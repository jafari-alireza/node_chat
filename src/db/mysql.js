var mysql = require("mysql");
var cryptoJS = require("crypto-js");
var moment = require('moment');

var cn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database : "node_chat",
  multipleStatements: true
});

var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database : "node_chat",
  connectionLimit: 10,
  supportBigNumbers: true
});

// get last message where session_id = id
exports.lastMessage = function(id, callback) {
  var queries = [];
  var sql = "";

  for (var i = id.length - 1; i >= 0; i--) {
    queries.push("SELECT user_id,contact_id,message,created_at,session_id,id FROM messages WHERE session_id=" + cn.escape(id[i].session_id) + " ORDER BY id DESC LIMIT 1");
  }

  sql = queries.join(';');
  cn.query(sql, function(err, results) {
    if(err) { console.log(err); callback(true); return; }
    callback(false, results);
  });
};

// get all message where session_id = id
exports.allMessage = function(id, callback) {
  var sql = "SELECT * FROM messages WHERE session_id=? ORDER BY id DESC";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get all message where session_id = id
exports.allMessage_count = function(id, callback) {
  var queries = [];
  var sql = "";

  for (var i = id.length - 1; i >= 0; i--) {
    queries.push("SELECT COUNT(*) AS total FROM messages WHERE session_id=" + cn.escape(id[i].session_id));
  }

  sql = queries.join(';');
  cn.query(sql, function(err, results) {
    if(err) { console.log(err); callback(true); return; }
    callback(false, results);
  })
};

// make hashed_id
exports.insertMessage = function(message, hashed_id, sender, reciver, callback) {
  var insert  = {message: message, user_id: sender, contact_id: reciver, session_id: hashed_id};
  var sql = "INSERT INTO messages SET ?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [insert], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get hashed_id
exports.hashedId = function(sender, reciver, callback) {
  var sql = "SELECT * FROM sessions_message WHERE ( sender=? AND reciver=? ) OR ( sender=? AND reciver=? )";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [sender, reciver, reciver, sender], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// make hashed_id
exports.hashedId_make = function(sender, reciver, callback) {
  var hashed_id = cryptoJS.SHA256(sender + reciver, (new Date()).valueOf().toString()).toString();
  var insert  = {sender: sender, reciver: reciver, session_id: hashed_id};
  var sql = "INSERT INTO sessions_message SET ?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [insert], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};


// get user hashed_id
exports.hashedId_distinct = function(id, callback) {
  var sql = "SELECT DISTINCT session_id FROM sessions_message WHERE sender=? or reciver=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id, id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get all unread message as sender
exports.notification_message_user_all_unread = function(id, callback) {
  var sql = "SELECT COUNT(*) AS total FROM messages WHERE contact_id=? AND seen_at IS NULL";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get all detailed unread message as sender 
exports.notification_message_user_all_unread_detail = function(id, session_id, callback) {
  var queries = [];
  var sql = "";

  for (var i = session_id.length - 1; i >= 0; i--) {
    queries.push("SELECT COUNT(*) AS total FROM messages WHERE (session_id= " + cn.escape(session_id[i].session_id) + 
        " AND " + "user_id!=" +  cn.escape(id) + ") AND seen_at IS NULL");
    // queries.push("SELECT COUNT(*) AS total FROM messages WHERE session_id=" + cn.escape(id[i].session_id));
  }

  sql = queries.join(';');
  cn.query(sql, function(err, results) {
    if(err) { console.log(err); callback(true); return; }
    callback(false, results);
  })
};


// get all unread message as sender
exports.notification_message_user_all_unread_detailed = function(contact_id, session_id, callback) {
  var sql = "SELECT COUNT(*) AS total FROM messages WHERE session_id=? AND contact_id=? AND seen_at IS NULL";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [session_id, contact_id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};


// get all unread message as contact
exports.notification_message_all_unseen = function(id, callback) {
  var sql = "SELECT COUNT(*) AS total FROM messages WHERE user_id=? AND seen_at IS NULL";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get all detailed unread message as contact 
exports.notification_message_all_unseen_detail = function(id, callback) {
  var sql = "SELECT DISTINCT contact_id FROM messages WHERE user_id=? AND seen_at IS NULL";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

exports.notification_update = function(contact_id, session_id, callback) {
  moment.locale('fa');
  var now = moment();
  var update  = {seen_at: now};
  var sql = "UPDATE messages SET ? WHERE contact_id=? AND session_id=?";
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [update, contact_id, session_id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};


// get sender id
exports.sender_message = function(id, callback) {
  var sql = "SELECT user_id FROM messages WHERE session_id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get contact_info
exports.contact_info = function(id, callback) {
  var queries = [];
  var sql = "";

  for (var i = 0; i < id.length; i++) {
    queries.push("SELECT user_name FROM users WHERE id=" + cn.escape(id[i]) + " LIMIT 1");
  }

  sql = queries.join(';');
  cn.query(sql, function(err, results) {
    if(err) { console.log(err); callback(true); return; }
    callback(false, results);
  });
};

// get susers of the session
exports.session_users = function(id, callback) {
  var sql = "SELECT sender,reciver FROM sessions_message WHERE session_id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get user_name
exports.user_name = function(id, callback) {
  var sql = "SELECT user_name FROM users WHERE id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// get user's email
exports.email = function(id, callback) {
  var sql = "SELECT email FROM users WHERE id=?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [id], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};


// create new user
exports.check_user_email = function(email, callback) {
  var sql = "SELECT email FROM users WHERE email=? LIMIT 1";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [email], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// create new user
exports.create_user = function(email, username, password, callback) {
  var hashed_password = cryptoJS.SHA256(password, (new Date()).valueOf().toString()).toString();
  var insert  = {email: email, user_name: username, password: hashed_password};
  var sql = "INSERT INTO users SET ?";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [insert], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};

// create new user
exports.login_user = function(email, password, callback) {
  var hashed_password = cryptoJS.SHA256(password, (new Date()).valueOf().toString()).toString();
  var sql = "SELECT id FROM users WHERE email=? AND password=? LIMIT 1";
  // get a connection from the pool
  pool.getConnection(function(err, connection) {
    if(err) { console.log(err); callback(true); return; }
    // make the query
    connection.query(sql, [email, hashed_password], function(err, rows) {
      connection.release();
      if(err) { console.log(err); callback(true); return; }
      callback(false, rows);
    });
  });
};