var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js'),
	helpers = 		require('../helpers/helpers.js');


router.get('/make-reservations/:eventId', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('../login');
	}

	// If there is a session, render users past reservations
	else {
		let context = {};
		eventId = req.params.eventId;

		context.eventDetails = await event.findEvent(eventId);
		context.eventCreator = await event.getEventCreator(eventId);
		let existingSlots = await slot.findEventSlots(eventId);
		for (let slot of existingSlots) {
			let startTime = new Date(slot.slot_date);												// get date of slot start
			startTime.setUTCHours(slot.start_time.substring(0,2), slot.start_time.substring(3,5));	// set time of slot start
			let endTime = new Date(startTime.getTime() + slot.duration * 60000);					// set date/time of slot end
			slot['start_time'] = startTime;
			slot['end_time'] = endTime;
		}
		//context.slotAttendees = await helpers.processEventSlots(slots, eventId);
		context.existingSlots = existingSlots;
		// Find all slots a user registered for in the past
		//let [reservations, fields] = await slot.findPastUserSlots(req.session.onid);

		// Process response from database into a handlebars-friendly format
		//context.eventsAttending = await helpers.processReservationsForDisplay(reservations, req.session.onid);

		context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
		'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
		context.scripts = ['calendarReservation.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
		'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
		res.render('make-reservations', context);
	}
});

module.exports = router;
