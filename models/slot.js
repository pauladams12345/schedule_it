var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Query database for all slots which a user has reserved and return all columns
// from the Slot, Reserve_Slot, and Event tables
module.exports.findUserSlots = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT slot_id, DATE_FORMAT(slot_date, '%a %b %D %Y') slot_date," +
			"start_time, duration, slot_location," +
			" event_name, description, event_id FROM `Slot` s " +
			"INNER JOIN `Reserve_Slot` rs ON s.slot_id = rs.fk_slot_id " +
			"RIGHT JOIN `Event` e ON s.fk_event_id = e.event_id " +
			"WHERE fk_onid = ? " +
			"ORDER BY s.slot_date",
			[onid]);
		connection.end();
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};

// Create row in Reserve_Slot with the given information
module.exports.reserveSlot = async function(onid, slot) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query("INSERT INTO indaba_db.Reserve_Slot (`fk_onid`,`fk_slot_id`) VALUES (?,?)",
		  [onid, slot]);
		connection.end();
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

module.exports.eventSlotResv = async function(eventId){
	try{
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT first_name, last_name, " +
		"ONID_email, DATE_FORMAT(slot_date, '%a %b %D %Y') slot_date, start_time, end_time, location FROM  `Event` " +
		"INNER JOIN `Slot` ON fk_event_id = event_id INNER JOIN `Reserve_Slot` ON " +
		"fk_slot_id = slot_id INNER JOIN `OSU_member` ON fk_onid = onid WHERE event_id = ? ORDER BY slot_date", [eventId]);
		return [rows, fields];
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

module.exports.createSlot = async function(eventId, location, date, start_time, end_time, duration, maxAttendees){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query("INSERT INTO `indaba_db`.`Slot` " +
		"(`fk_event_id`, `slot_location`, `slot_date`, `start_time`, `end_time`, `duration`, max_attendees) VALUES (?, ?, ?, ?, ?, ?, ?);",
		 [eventId, location, date, start_time, end_time, duration, maxAttendees]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};
