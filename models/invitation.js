// Database functions most closely related to the Invitation table

var	dbcon = 	require('../config/dbcon.js'),
	sql =   	require('mysql2/promise');

// Given an event id and an array of email addresses, create rows in the Invitation table
module.exports.createInvitations = async function(eventId, emails) {
	try {
		const connection = await sql.createConnection(dbcon);

		for (let email of emails) {
			await connection.query(
			"INSERT INTO `indaba_db`.`Invitation` " +
			"(`fk_event_id`, `email_address`) VALUES (?, ?);", 
			[eventId, email]);
		}
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};

// Get all rows with the matching event id
module.exports.findEventInvitations = async function(eventId) {
	try {
		const connection = await sql.createConnection(dbcon);

		let [rows, fields] = await connection.query(
		"SELECT `invitation_id`, `fk_event_id`, `email_address` " +
		"FROM `Invitation` " +
		"WHERE fk_event_id = ?;",
		[eventId]);
		connection.end();
		return rows;
	}
	catch (err) {
		console.log(err);
	}
};

// Delete slot with the given ID
module.exports.deleteInvitation = async function(eventId){
	try{
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"DELETE FROM `Invitation` " +
		"WHERE `fk_event_id` = ?;",
		 [eventId]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};
