var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

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