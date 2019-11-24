var parser =	require('xml2json'),
	rp = 		require('request-promise-native'),
	user =		require('../models/user.js'),
	slot =    require('../models/slot.js'),
	event =		require('../models/event.js');

// Send validation request to CAS server with ticket, return attributes from response
// TODO: handle errors
module.exports.validateTicket = async function(cas_ticket){
	try {

		// Options for the CAS validation request
		let options = {
			method: 'GET',
			uri: 'https://login.oregonstate.edu/idp/profile/cas/serviceValidate',
			headers: {
				'Content-Type': 'text/xml'
			},
			qs: {
				ticket: cas_ticket,
				service: 'https://indaba-scheduler.herokuapp.com/'
			}
		};

		// Validate ticket
		const cas_info = await rp(options);

		// Parse results from validation, converting from XML to JSON
		let json = JSON.parse(parser.toJson(cas_info));
		let cas_attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];

		// Extract user's attributes
		let attributes = {};
		attributes.onid = cas_attributes['cas:uid'];
		attributes.firstName = cas_attributes['cas:firstname'];
		attributes.lastName = cas_attributes['cas:lastname'];
		attributes.fullName = cas_attributes['cas:fullname'];
		attributes.email = cas_attributes['cas:email'];

		// Return user's attributes
		return attributes;
	}
	catch (err) {
		console.log(err);
	}
};

// Check if user exists in database. If not, create an entry.
module.exports.createUserIfNew = async function(attributes){
	try {
		// Check if user exists
		const [rows, fields] = await user.findUser(attributes.onid);

		// If not, add an entry
		if (rows.length == 0) {
			await user.createUser(attributes.onid, attributes.firstName, attributes.lastName, attributes.email);
		}
	}
	catch (err){
		console.log(err);
	}
};

module.exports.parseDateTimeString = async function (slot){
	let date = slot.toISOString().substring(0,10);
	let time = slot.toISOString().substring(11,19);
	return [date, time];
};

module.exports.processReservationsForDisplay = async function (reservations, user_ONID){
	let event_ids = []; 	// Keep track of which events we've added
	let events = {};		// Store the details of each event in a handlebars-friendly format

	// Loop over each reservation to fill the events object
	for (let resv of reservations) {
		let id = resv.event_id;

		// If we haven't seen this event before, create a nested object for it
		if ( !event_ids.includes(id) ){
			event_ids.push(id);								// add current event ID to tracking array
			events[id] = {									// create event object
				title: resv.event_name,
				creator: await event.getEventCreator(id),
				description: resv.description,
				reservations: {}
			};
		}

		//  Create a nested  object for the current reservation
		let dateTime = new Date(resv.slot_date + 'T' + resv.start_time);
		let dateString = dateTime.toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric' , year: 'numeric'});
		let timeString = dateTime.toLocaleTimeString('en-US') + ' - ';
		timeString += new Date(dateTime.getTime() + resv.duration * 60000).toLocaleTimeString('en-US');

		events[id].reservations[resv.slot_id] = {
			date: dateString,
			time:  timeString,
			location: resv.slot_location,
			attendees: {}
		};
		const [attendees, fields] = await slot.findSlotAttendees(resv.slot_id);
		for (let attendee of attendees){
			if(attendee.onid != user_ONID){
				events[id].reservations[resv.slot_id].attendees[attendee.onid] = {
					firstName: attendee.first_name,
					lastName: attendee.last_name,
					email: attendee.ONID_email
				};
			}
		}
	}
	return events;
};

module.exports.processEventSlots = async function (existingSlots){
	let slots = {};		// Store the details of each slot in a handlebars-friendly format

	// Loop over each reservation to fill the events object
	for (let resv of existingSlots) {
		slots[resv.slot_id] = {
			slot_id: resv.slot_id,
			start_time: resv.start_time,
			end_time: resv.end_time,
			location: resv.slot_location,
			attendees: {}
		};
		const [attendees, fields] = await slot.findSlotAttendees(resv.slot_id);
		for (let attendee of attendees){
			//if(attendee.onid != user_ONID){
			slots[resv.slot_id].attendees[attendee.onid] = {
			//slots[resv.slot_id].attendees = {
				firstName: attendee.first_name,
				lastName: attendee.last_name,
				email: attendee.ONID_email
				};
			//}
		}
	}
	return slots;
};
