var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Query database for all slots which a user has reserved and return all columns
// from the Slot, Reserve_Slot, and Event tables
module.exports.findUserSlots = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT slot_id, DATE_FORMAT(slot_date, '%a %b %D %Y') slot_date, start_time, duration, slot_location," +
			" event_name, description, event_id FROM `Slot` s " +
			"INNER JOIN `Reserve_Slot` rs ON s.slot_id = rs.fk_slot_id " +
			"RIGHT JOIN `Event` e ON s.fk_event_id = e.event_id " +
			"WHERE fk_onid = ? " +
			"ORDER BY s.slot_date",
			[onid]);
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
		const [rows, fields] = await connection.query("SELECT * FROM indaba_db.Reserve_Slot INNER JOIN indaba_db.Slot" +
		"ON fk_slot_id = slot_id INNER JOIN indaba_db.OSU_member ON fk_onid = onid WHERE slot_id = 2");
		return [rows, fields];
	}
	catch (err) {
		console.log(err);
	}
};
