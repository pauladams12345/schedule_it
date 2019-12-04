// Database functions most closely related to the Responds_To_Request table

var	dbcon = 	require('../config/dbcon.js'),
	sql =   	require('mysql2/promise');

// Create row with the given information
module.exports.createResponse = async function(onid, eventId, response) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"INSERT INTO `Responds_To_Request`" +
		"(`fk_onid`,`fk_event_id`, `attending`) VALUES (?,?,?)",
		  [onid, eventId, response]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Update attending to the specified value for a given onid and eventId
module.exports.updateResponse = async function(onid, eventId, response) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"UPDATE `Responds_To_Request` " +
		"SET `attending` = ? " +
		"WHERE `fk_onid`= ? AND `fk_event_id`= ?",
		[response, onid, eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Get the value of attending from a row with the given onid and eventId
// Returns the entire rows array (even if empty), not just the response
module.exports.getResponse = async function(onid, eventId) {
	try {
const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT `attending` " +
		"FROM `Responds_To_Request` " +
		"WHERE `fk_onid` = ? AND `fk_event_id` = ?",
		  [onid, eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);	
	}
};

// Delete a row with the given onid and eventId
module.exports.deleteResponsesForEvent = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"DELETE FROM `Responds_To_Request` " + 
		"WHERE `fk_event_id` = ?", 
		[eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);	
	}
};

