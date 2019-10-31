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