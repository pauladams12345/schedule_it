var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Query database for all slots which a user has reserved with a
// date of yesterday or earlier
module.exports.findPastUserSlots = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT slot_id, DATE_FORMAT(slot_date, '%Y-%m-%d') slot_date," +
			"start_time, duration, slot_location," +
			" event_name, description, event_id FROM `Slot` s " +
			"INNER JOIN `Reserve_Slot` rs ON s.slot_id = rs.fk_slot_id " +
			"RIGHT JOIN `Event` e ON s.fk_event_id = e.event_id " +
			"WHERE fk_onid = ? AND slot_date < CURDATE() - INTERVAL 1 DAY " +
			"ORDER BY s.slot_date",
			[onid]);
		connection.end();
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};

// Query database for all slots which a user has reserved with a
// date of yesterday or later
module.exports.findUpcomingUserSlots = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT slot_id, DATE_FORMAT(slot_date, '%Y-%m-%d') slot_date," +
			"start_time, duration, slot_location," +
			" event_name, description, event_id " +
			"FROM `Slot` s " +
			"INNER JOIN `Reserve_Slot` rs ON s.slot_id = rs.fk_slot_id " +
			"RIGHT JOIN `Event` e ON s.fk_event_id = e.event_id " +
			"WHERE fk_onid = ? AND slot_date >= CURDATE() - INTERVAL 1 DAY " +
			"ORDER BY s.slot_date",
			[onid]);
		connection.end();
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};

// Query database for slot by its ID and return all columns for that row
module.exports.findSlot = async function(slotId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT * FROM `Slot` WHERE slot_id = ?", [slotId]);
		connection.end();
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};

// Query database for all of the individuals who signed up for the slot
module.exports.findSlotAttendees = async function(slotId) {
	try {
		const connection = await sql.createConnection(dbcon);
		//const [rows, fields] = await connection.query("SELECT * FROM `Slot` WHERE slot_id = ?", [slotId]);
		const [rows, fields] = await connection.query(
		"SELECT * FROM `Reserve_Slot` INNER JOIN `Slot`" +
		"ON fk_slot_id = slot_id INNER JOIN `OSU_member` ON fk_onid = onid WHERE slot_id = ?", [slotId]);
		connection.end();
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};

// Find all slots for a given event
module.exports.findEventSlots = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT s.slot_id, s.slot_date, s.start_time, s.end_time, " +
		"s.duration, s.slot_location, s.max_attendees " +
		"FROM `Slot` s " +
		"INNER JOIN `Event` e ON s.fk_event_id = e.event_id " +
		"WHERE s.fk_event_id = ?",
		[eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);
	}
};

// Find all slot reservations for a given event
module.exports.eventSlotResv = async function(eventId){
	try{
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT first_name, last_name, slot_id, onid, " +
		"ONID_email, slot_date, start_time, end_time, location FROM  `Event` " +
		"INNER JOIN `Slot` ON fk_event_id = event_id INNER JOIN `Reserve_Slot` ON " +
		"fk_slot_id = slot_id INNER JOIN `OSU_member` ON fk_onid = onid WHERE event_id = ? ORDER BY slot_date", [eventId]);
		return rows;
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Create a slot with the given info
module.exports.createSlot = async function(eventId, location, date, startTime, endTime, duration, maxAttendees){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query("INSERT INTO `indaba_db`.`Slot` " +
		"(`fk_event_id`, `slot_location`, `slot_date`, `start_time`, `end_time`, " +
		"`duration`, max_attendees) VALUES (?, ?, ?, ?, ?, ?, ?);",
		 [eventId, location, date, startTime, endTime, duration, maxAttendees]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Update a slot with the given info
module.exports.editSlot = async function(location, date, startTime, endTime, duration, maxAttendees, slotId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query("UPDATE `Slot` " +
		"SET `slot_location` = ?, `slot_date` = ?, `start_time` = ?, `end_time` = ?, `duration` = ?, max_attendees = ?" +
		"WHERE `slot_id` = ?",
		 [location, date, startTime, endTime, duration, maxAttendees, slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Delete slot with the given ID
module.exports.deleteSlot = async function(slotId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query("DELETE FROM `Slot` " +
		"WHERE `slot_id` = ?;",
		 [slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Delete slot with the given ID
module.exports.deleteSlotByEventId = async function(eventId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query("DELETE FROM `Slot` " +
		"WHERE `fk_event_id` = ?;",
		 [eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Query database for slot by its ID and return all columns for that row
module.exports.findUserSlots = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT fk_slot_id FROM `Reserve_Slot` " +
		"INNER JOIN OSU_member ON fk_onid = onid WHERE onid = ?", [onid]);
		connection.end();
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};
