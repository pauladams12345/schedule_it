var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js');
	helpers = 		require('../helpers/helpers.js');

router.get('/past-events', async function (req, res, next) {
	
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('../login');
	}

	// If there is a session, render users past reservations
	else {
		let pastEvents = await createsEvent.getPastUserEvents(req.session.onid);
		let events = []

		for (let pastEvent of pastEvents) {
			let eventDetails = await event.findEvent(pastEvent.event_id);
			eventDetails['reservations'] = await slot.eventSlotResv(pastEvent.event_id);
			eventDetails['invitations'] = await invitation.findEventInvitations(pastEvent.event_id);
			eventDetails['organizers'] = await createsEvent.getEventOrganizers(pastEvent.event_id)
			eventDetails['slots'] = await slot.findEventSlots(pastEvent.event_id);
			
			// Add the hour to the start date so that the client can convert time zones correctly
			helpers.combineDateAndTime(eventDetails.slots);
			helpers.combineDateAndTime(eventDetails.reservations);

			events.push(eventDetails);
		}

		// console.log(JSON.stringify(events, null, 2));
		let context = {};
		context.events = events;
		context.stylesheets = ['main.css'];
		context.scripts = ['convertISOToLocal.js'];
		res.render('past-events', context);
	}
});

// TODO: restrict access to event creator
router.get('/past-events-test', async function (req, res, next) {
	let onid = 'adamspa';
	let pastEvents = await createsEvent.getPastUserEvents(onid);
	let events = []

	for (let pastEvent of pastEvents) {
		let eventDetails = await event.findEvent(pastEvent.event_id);
		eventDetails['reservations'] = await slot.eventSlotResv(pastEvent.event_id);
		eventDetails['invitations'] = await invitation.findEventInvitations(pastEvent.event_id);
		eventDetails['organizers'] = await createsEvent.getEventOrganizers(pastEvent.event_id)
		eventDetails['slots'] = await slot.findEventSlots(pastEvent.event_id);
		
		// Add the hour to the start date so that the client can convert time zones correctly
		helpers.combineDateAndTime(eventDetails.slots);
		helpers.combineDateAndTime(eventDetails.reservations);

		events.push(eventDetails);
	}
	console.log(JSON.stringify(events, null, 4));

	// console.log(JSON.stringify(events, null, 2));
	let context = {};
	context.events = events;
	context.stylesheets = ['main.css'];
	context.scripts = ['convertISOToLocal.js'];
	res.render('past-events', context);
});

module.exports = router;