// Database functions most closely related to the Event table

var	dbcon = 	require('../config/dbcon.js'),
	sql =   	require('mysql2/promise');

// Create an event with the given parameters
module.exports.createEvent = async function(eventName, location,
	maxAttendeePerSlot, maxResvPerAttendee, description, visibility) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"INSERT INTO `indaba_db`.`Event` " +
		"(`event_name`, `location`, `max_attendee_per_slot`, " +
		"`max_resv_per_attendee`, `description`, `visibility`) " +
		"VALUES (?, ?, ?, ?, ?, ?);",
		  [eventName, location, maxAttendeePerSlot, maxResvPerAttendee,
		  description, visibility]);
		const [rows, fields] = await connection.query("SELECT LAST_INSERT_ID()");
		let eventId = rows[0]['LAST_INSERT_ID()'];
		connection.end();

		return eventId;
	}
	catch (err) {
		console.log(err);
	}
};

// Query database for an event by its ID and return all columns for that row
module.exports.findEvent = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT * FROM `Event` " +
			"WHERE event_id = ?", [eventId]);
		connection.end();
		return rows[0];
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
			"SELECT om.first_name, om.last_name " +
			"FROM `OSU_member` om " +
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

// Update the name for a given event to the specified value
module.exports.editName = async function(eventId, name) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"UPDATE `Event` " +
			"SET `event_name`= ? " +
			"WHERE `event_id`= ?;",
			[name, eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Update the description for a given event to the specified value
module.exports.editDescription = async function(eventId, description) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"UPDATE `Event` " +
			"SET `description`= ? " +
			"WHERE `event_id`= ?;",
			[description, eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Update the maximum number of reservations per attendee for a given event to the specified value
module.exports.editMaxResvPerAttendee = async function(eventId, max_resv_per_attendee) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"UPDATE `Event` " +
			"SET `max_resv_per_attendee`= ? " +
			"WHERE `event_id`= ?;",
			[max_resv_per_attendee, eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Update the attendee name visibility for a given event to the specified value
module.exports.editVisibility = async function(eventId, visibility) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"UPDATE `Event` " +
			"SET `visibility`= ? " +
			"WHERE `event_id`= ?;",
			[visibility, eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Delete slot with the given ID
module.exports.deleteEvent = async function(eventId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"DELETE FROM `Event` " +
		"WHERE `event_id` = ?;",
		 [eventId]);
    connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Update the expiration date for the given event to the specified value
module.exports.editExpirationDate = async function(eventId, expirationDate) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"UPDATE `Event` " +
			"SET `expiration_date`= ? " +
			"WHERE `event_id`= ?;",
			[expirationDate, eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Set the expiration date for the given event to NULL
module.exports.nullifyExpirationDate = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"UPDATE `Event` " +
			"SET `expiration_date`= NULL " +
			"WHERE `event_id`= ?;",
			[eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};