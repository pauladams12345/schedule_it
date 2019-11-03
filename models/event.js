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
module.exports.getTimeInterval = async function(startTime, duration) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT ADDTIME ('" + startTime + "','" + duration + "') AS end_time");
		let startTimePM = await convertTime(startTime, rows[0].end_time);
		let endTimePM = await convertTime(rows[0].end_time);
		return startTimeAMPM + "-" + endTimeAMPM;
	}
	catch (err) {
		console.log(err);
	}
};

module.exports.convertTime = async function(slotTime){
	try{
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"Select TIME_FORMAT(slotTime, '%h:%i%p') slotTime AS timePM");
		return rows[0].timePM
	}
};
