var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Find all slots for which a user has a reservation
module.exports.findUserSlots = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
			"SELECT * FROM `Slot` s "
			+ "INNER JOIN `Reserve_Slot` rs ON s.slot_id = rs.fk_slot_id "
			+ "RIGHT JOIN `Event` e ON s.fk_event_id = e.event_id "
			+ "WHERE fk_onid = ? "
			+ "ORDER BY s.slot_date",
			  [onid]);
		return [rows, fields];
	} 
	catch (err) {
		console.log(err);
	}
}

module.exports.findSlot = async function(slotId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT * FROM `Slot` WHERE slot_id = ?", [slotId]);
		return [rows, fields];
	} 
	catch (err) {
		console.log(err);
	}
}