var	dbcon = 	require('../config/dbcon.js'),
	sql =   	require('mysql2/promise');

// Create row in Reserve_Slot with the given information
module.exports.createReservation = async function(onid, slotId) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"INSERT INTO `Reserve_Slot` " +
		"(`fk_onid`,`fk_slot_id`) VALUES (?,?)",
		  [onid, slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Delete slot with the given ID
module.exports.deleteReservation = async function(onid, slotId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"DELETE FROM `Reserve_Slot` " +
		"WHERE `fk_onid` = ? and `fk_slot_id` = ?;",
		 [onid, slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Delete a reserved slot for a given event
module.exports.deleteReservedSlotReservations = async function(slotId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"DELETE FROM `Reserve_Slot` " +
		"WHERE `fk_slot_id` = ?;",
		 [slotId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

module.exports.getEventAttendees = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT DISTINCT om.first_name, om.last_name, om.ONID_email, om.onid " +
		"FROM `Reserve_Slot` rs " +
		"INNER JOIN `Slot` s ON rs.fk_slot_id = s.slot_id " +
		"INNER JOIN `OSU_member` om ON rs.fk_onid = om.onid " +
		"INNER JOIN `Event` e ON s.fk_event_id = e.event_id " +
		"WHERE e.event_id = ?", [eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);
	}	
};

//number of total reservations a user has made for a given event.
module.exports.getNumUserReservations = async function(onid, eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT COUNT (*) AS num " +
		"FROM `Slot` s " +
		"INNER JOIN `Event` e ON s.fk_event_id = e.event_id " +
		"INNER JOIN `Reserve_Slot` rs ON rs.fk_slot_id = s.slot_id " +
		"WHERE rs.fk_onid = ? AND s.fk_event_id = ?", [onid, eventId]);
		connection.end();
		return rows[0].num;
	}
	catch (err) {
		console.log(err);
	}
};
