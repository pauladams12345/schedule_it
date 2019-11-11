var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Create an event with the given parameters
module.exports.createEvent = async function(event_name, location, 
	max_attendee_per_slot, max_resv_per_attendee, description, visibility) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query("INSERT INTO `indaba_db`.`Event` (`event_name`, `location`, `max_attendee_per_slot`, `max_resv_per_attendee`, `description`) VALUES (?, ?, ?, ?, ?);",
		  [event_name, location, max_attendee_per_slot, max_resv_per_attendee,
		  description, visibility]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
}

// Query database for an event by its ID and return all columns for that row
module.exports.findEvent = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT * FROM `Event` WHERE event_id = ?", [eventId]);
		connection.end();
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
		connection.end();
		return rows[0].first_name + " " + rows[0].last_name;
	}
	catch (err) {
		console.log(err);
	}
};

//takes a time in MySQL 24h time format and converts to 12h format
convertTime = async function(slotTime){
	try{
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT TIME_FORMAT('" + slotTime + "', '%h:%i%p') AS timePM");
		connection.end();
		return rows[0].timePM
	}
	catch (err) {
		console.log(err);
	}
};

//takes the events time and duration and returns the end time for the event
//Note: this function uses convertTime to convert to 12h format.
module.exports.getTimeInterval = async function(startTime, duration) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT ADDTIME ('" + startTime + "','" + duration + "') AS end_time");
		let startTimeAMPM = await convertTime(startTime, rows[0].end_time);
		let endTimeAMPM = await convertTime(rows[0].end_time);
		connection.end();
		return startTimeAMPM + "-" + endTimeAMPM;
	}
	catch (err) {
		console.log(err);
	}
};
