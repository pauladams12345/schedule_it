var	dbcon = 	require('../middleware/dbcon.js'),
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
