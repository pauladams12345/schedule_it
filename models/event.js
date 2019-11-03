var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Query database for an event by its ID and return all columns for that row
module.exports.findEvent = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT * FROM `Event` WHERE event_id = ?", [eventId]);
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};

// Query database for an event by its ID and return a string containing
// the creator's first name and last name
module.exports.getEventCreator = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT om.first_name, om.last_name FROM `OSU_member` om " +
			"INNER JOIN `Creates_Event` ce ON om.onid = ce.fk_onid " +
			"INNER JOIN `Event` e ON ce.fk_event_id = e.event_id " +
			"WHERE e.event_id = ? ",
			[eventId]);
		return rows[0].first_name + " " + rows[0].last_name;
	}
	catch (err) {
		console.log(err);
	}
};

//takes the events time and duration and returns the end time for the event
module.exports.getTimeInterval = async function(startTime, durationMin) {
	try {
		durationSec = durationMin*60;
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT ADDTIME (?, ?)",
			[startTime],[durationSec]);
		return startTime + "-" + row[0];
	}
	catch (err) {
		console.log(err);
	}
};
