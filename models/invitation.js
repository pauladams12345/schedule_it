var	dbcon = 	require('../middleware/dbcon.js'),
	sql =   	require('mysql2/promise');

module.exports.createInvitations = async function(eventId, emails) {
	try {
		const connection = await sql.createConnection(dbcon);

		for (let email of emails) {
			await connection.query("INSERT INTO `indaba_db`.`Invitation` " +
			"(`fk_event_id`, `email_address`) VALUES (?, ?);", [eventId, email]);
		}
		connection.end();
	}
	catch (err) {
		console.log(err);
	}
}