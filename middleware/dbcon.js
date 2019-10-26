mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'indaba-1.c0ib6xevgq1s.us-east-1.rds.amazonaws.com',
  user            : 'indaba_admin',
  password        : 'abadni619',
  database        : 'indaba-1'
});

//error handling for database connection: https://www.w3resource.com/node.js/nodejs-mysql.php#Error_handling
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})

module.exports.pool = pool;
