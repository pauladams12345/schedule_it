// Miscellaneous helper functions

var parser =	require('xml2json'),
	rp = 		require('request-promise-native'),
	user =		require('../models/user.js'),
	slot =    	require('../models/slot.js'),
	event =		require('../models/event.js');

// Send validation request to CAS server with ticket, return attributes from response
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
		let response = JSON.parse(parser.toJson(cas_info));
		let cas_attributes = response['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];

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
		const rows = await user.findUser(attributes.onid);

		// If not, add an entry
		if (rows.length == 0) {
			await user.createUser(attributes.onid, attributes.firstName, attributes.lastName, attributes.email);
		}
	}
	catch (err){
		console.log(err);
	}
};

// Take a JS date object, convert it to an ISO-formatted string,
// and extract the date and time from that string
module.exports.parseDateTimeString = function (slot){
	let date = slot.toISOString().substring(0,10);
	let time = slot.toISOString().substring(11,19);
	return [date, time];
};

// Find all of a user's upcoming reserved slots and gather the needed information
// to display those slots in an organized way
module.exports.processUpcomingReservationsForDisplay = async function(onid) {
	let eventIds = [];											// keep track of which events we've seen
	let events = {};											// hold info for each event
	let upcomingSlots = await slot.findUpcomingUserSlots(onid);	// all of a user's upcoming slots

	// Process each upcoming slot the user has reserved
	for (let upcomingSlot of upcomingSlots) {

		// If we haven't seen this event before, create a nested array for it
		if ( !eventIds.includes(upcomingSlot.event_id) ){
			eventIds.push(upcomingSlot.event_id);				// add current event ID to tracking array
			events[upcomingSlot.event_id] = {					// create event object
				title: upcomingSlot.event_name,
				creator: upcomingSlot.creator_first_name + " " + upcomingSlot.creator_last_name,
				description: upcomingSlot.description,
				visibility: upcomingSlot.visibility,
				event_id: upcomingSlot.event_id,
				reservations: []								// array to hold each upcoming reserved slot for this event
			};
		}
		upcomingSlot['attendees'] = await slot.findSlotAttendees(upcomingSlot.slot_id);	// add attendee info for this slot
		events[upcomingSlot.event_id].reservations.push(upcomingSlot);					// add slot to its event object
	}
	for (let id in events) {									// Convert date and time values to ISO format
		helpers.combineDateAndTime(events[id].reservations);
	}

	if (eventIds.length > 0) {
		return events;
	}
	else {
		return null;
	}
};

// Find all of a user's past reserved slots and gather the needed information
// to display those slots in an organized way
module.exports.processPastReservationsForDisplay = async function(onid) {
	let eventIds = [];											// keep track of which events we've seen
	let events = {};											// hold info for each event
	let pastSlots = await slot.findPastUserSlots(onid);			// all of a user's past slots

	// Process each past slot the user has reserved
	for (let pastSlot of pastSlots) {

		// If we haven't seen this event before, create a nested array for it
		if ( !eventIds.includes(pastSlot.event_id) ){
			eventIds.push(pastSlot.event_id);					// add current event ID to tracking array
			events[pastSlot.event_id] = {						// create event object
				title: pastSlot.event_name,
				creator: pastSlot.creator_first_name + " " + pastSlot.creator_last_name,
				description: pastSlot.description,
				visibility: pastSlot.visibility,
				reservations: []								// array to hold each past reserved slot for this event
			};
		}
		pastSlot['attendees'] = await slot.findSlotAttendees(pastSlot.slot_id);	// add attendee info for this slot
		events[pastSlot.event_id].reservations.push(pastSlot);					// add slot to its event object
	}
	for (let id in events) {									// Convert dates and times to separate ISO 8601 formatted values
		helpers.combineDateAndTime(events[id].reservations);
	}

	return events;
};

// Given an array of slots from the database, creates an object with nested objects
// containing each slots's information, including slot attendees
module.exports.processEventSlots = async function (existingSlots){
	let slots = {};		// Store the details of each slot in a handlebars-friendly format

	// Loop over each reservation to create objects
	for (let resv of existingSlots) {
		slots[resv.slot_id] = {
			slot_id: resv.slot_id,
			start_time: resv.start_time,
			end_time: resv.end_time,
			location: resv.slot_location,
			max_attendees: resv.max_attendees,
			attendees: {}
		};
		const attendees = await slot.findSlotAttendees(resv.slot_id);	// add attendee info
		for (let attendee of attendees){
			slots[resv.slot_id].attendees[attendee.onid] = {
				slotId: resv.slot_id,
				name: attendee.first_name + ' ' + attendee.last_name,
				email: attendee.ONID_email
			};
		}
	}
	return slots;
};

// Create a JS date object from a slot's date and set the hour to match
// the stored value to facilitate time zone adjustment
module.exports.combineDateAndTime = function (slots) {
	for (let slot of slots) {
		let date = new Date(slot['slot_date']);
		date.setUTCHours(slot['start_time'].substring(0,2));
		slot['slot_date'] = date.toISOString();
	}
};
