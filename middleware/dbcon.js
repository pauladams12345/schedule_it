var mysql =       require('mysql2'),
    session =     require('express-session'),
    MySQLStore =  require('express-mysql-session')(session);

var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'indaba-1.c0ib6xevgq1s.us-east-1.rds.amazonaws.com',
  user            : 'indabaAdmin',
  password        : 'abadni619',
  database        : 'indaba_db',
  port            : 3306,
  waitForConnections: true,
  queueLimit: 0
});


var sessionStore = new MySQLStore({}, pool.promise());

module.exports.sessionStore = sessionStore;
module.exports.pool = pool;
