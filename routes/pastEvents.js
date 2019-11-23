var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js');
	helpers = 		require('../helpers/helpers.js');

router.get('/past-events/:eventId', async function (req, res, next) {
	
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('../login');
	}

	// If there is a session, render users past reservations
	else {

	}
});

// TODO: restrict access to event creator
router.get('/past-events-test/:eventId', async function (req, res, next) {
	let eventId = req.params.eventId;
	let context = {};
	let [reservations, fields] = await slot.eventSlotResv(eventId);
	context.eventDetails = await event.findEvent(eventId);
	context.slotResv = reservations;
	context.invitations = await invitation.findEventInvitations(eventId);

	let existingSlots = await slot.findEventSlots(eventId);
	for (let slot of existingSlots) {
		let startTime = new Date(slot.slot_date);												// get date of slot start
		startTime.setUTCHours(slot.start_time.substring(0,2), slot.start_time.substring(3,5));	// set time of slot start
		let endTime = new Date(startTime.getTime() + slot.duration * 60000);					// set date/time of slot end
		slot['start_time'] = startTime;
		slot['end_time'] = endTime;
	}
	context.existingSlots = existingSlots;

	context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
	'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
	context.scripts = ['calendarManage.js', 'manage.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
	'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
	res.render('manage', context);
});

module.exports = router;