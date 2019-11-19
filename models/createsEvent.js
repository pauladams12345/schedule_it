var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Create a row in the Creates_Event table with the given information
module.exports.createCreatesEvent = async function(eventId, onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query("INSERT INTO `indaba_db`.`Creates_Event` " +
		"(`fk_event_id`, `fk_onid`) VALUES (?, ?);", [eventId, onid]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
}

module.exports.getUserEvents = async function(onid) {
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT e.event_name, e.event_id FROM `Event` e " +
		"INNER JOIN `Creates_Event` ce ON e.event_id = ce.fk_event_id " +
		"WHERE ce.fk_onid = ?;", [onid]);
		connection.end();	
		return rows;
	}
	catch (err) {
		console.log(err);
	}
}
