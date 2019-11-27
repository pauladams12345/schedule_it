var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

// Create row in Reserve_Slot with the given information
module.exports.setRequest = async function(onid, eventId, response) {
	try {
		const connection = await sql.createConnection(dbcon);
		await connection.query(
		"INSERT INTO `Responds_To_Request` " +
		"(`fk_onid`,`fk_event_id`, `attending`) VALUES (?,?,?)",
		  [onid, eventId, response]);
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
};
