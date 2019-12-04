// Database functions most closely related to the Reserve_Slot table

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

// Delete reservation for the corresponding onid and slot Id
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

// Delete a all reservations for the given slot
module.exports.deleteAllReservations = async function(slotId){
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

// Get info for all attendees of an event
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

// Return the number of total reservations a user has made for a given event.
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

// Return the slot Ids for each reservation a given user has made for a given event.
module.exports.getSlotIdsByUserAndEvent = async function(onid, eventId) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query(
		"SELECT rs.fk_slot_id " +
		"FROM `Reserve_Slot` rs " +
		"INNER JOIN `Slot` s ON s.slot_id = rs.fk_slot_id " +
		"INNER JOIN `Event` e ON s.fk_event_id = e.event_id " +
		"WHERE rs.fk_onid = ? AND s.fk_event_id = ?", [onid, eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);
	}
};
