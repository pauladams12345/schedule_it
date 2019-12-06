// Defines routes for the Create Event page

var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js'),
	helpers = 		require('../helpers/helpers.js'),
	email = 		require('../helpers/email.js');

// Displays "Create New Event" page
router.get('/create', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('/login');
	}
	else {
		let context = {};
		context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
		'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
		context.scripts = ['create.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
		'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
		res.render('create', context);
	}
});

// Process event creation form
router.post('/create', async function (req, res, next) {

	// Get values from request
	let context = {};
	let eventName = req.body.eventName;
	let defaultLocation = req.body.defaultLocation;
	let defaultMaxAttendees = req.body.defaultMaxAttendees;
	let maxResvPerAttendees = req.body.maxReservationsPerAttendee;
	let description = req.body.description.substring(0, 255);
	let visibility = req.body.attendeeNameVisibility;
	let emails = req.body.emails;
	let slotIds = req.body.slotIds;

	if (slotIds.length > 0) {
		slotIds = slotIds.split(',');
	}

	// Handle edge cases of 1 or 0 emails, convert to an array
	if (typeof emails === 'string') {
		emails = [emails];
	} else if (typeof emails === 'undefined') {
		emails = [];
	}

	// Store Event info in database, record the new eventId
	let eventId = await event.createEvent(eventName, defaultLocation,
		defaultMaxAttendees, maxResvPerAttendees, description, visibility);

	// Store the event creator in the database
	await createsEvent.createCreatesEvent(eventId, req.session.onid);

	// Store the invitations (users emails) in the database
	await invitation.createInvitations(eventId, emails);

	let lastSlotEndDate = null;		// track the ending date of the latest slot

	// Process all slots
	for (let id of slotIds) {
		if (req.body['slotState' + id] == 'new') {

			let start = new Date(req.body['slotStart' + id]);	// start date/time
			let end = new Date(req.body['slotEnd' + id]);		// end date/time
			let duration = (end - start) / 60000;				// duration in minutes
			let location = req.body['slotLocation' + id];		// location
			let maxAttendees = req.body['slotMaxAttendees' + id];// maximum number of attendees
			if (location == '') {								// if not specified, use default
				location = defaultLocation;
			}
			if (maxAttendees == '') {							// if not specified, use default
				maxAttendees = defaultMaxAttendees;
			}

			let [startDate, startTime] = await helpers.parseDateTimeString(start);	//convert start date/time to MySQL-compatible format
			let [endDate, endTime] = await helpers.parseDateTimeString(end);			//convert end date/time to MySQL-compatible format

			if (lastSlotEndDate < end) {						// Check if this is the latest ending slot
				lastSlotEndDate = end;
			}

			await slot.createSlot(eventId, location, startDate, startTime, endTime, duration, maxAttendees);	// Store slots in database
		}
	}

	// Set the expiration date to the end date of the latest slot
	if (lastSlotEndDate) {
		let [expirationDate, expirationTime] = await helpers.parseDateTimeString(lastSlotEndDate);
		await event.editExpirationDate(eventId, expirationDate);
	}

	// Send invitation emails
	if (emails.length > 0) {
		let organizerName = await event.getEventCreator(eventId);
		email.sendInvitationEmail(organizerName, eventName, description, eventId, emails);
	}

	res.send('/manage/' + eventId);
});

module.exports = router;
