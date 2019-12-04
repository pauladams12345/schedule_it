// Database functions most closely related to the OSU_member table

var	dbcon = 	require('../config/dbcon.js'),
	sql =   	require('mysql2/promise');

// Query database for user by onid, return matching row
module.exports.findUser = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT * FROM `OSU_member` " +
		"WHERE onid = ?", 
		[onid]);
		connection.end();
		return rows;
	} 
	catch (err) {
		console.log(err);
	}
};

// Create row in OSU_member with the given information
module.exports.createUser = async function(onid, firstName, lastName, email) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"INSERT INTO indaba_db.OSU_member " +
		"(`onid`,`first_name`,`last_name`,`ONID_email`) " +
		"VALUES (?,?,?,?)",
		[onid, firstName, lastName, email]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};