var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js');
	helpers = 		require('../helpers/helpers.js');

// Displays "Create New Event" page
router.get('/create', async function (req, res, next) {
	let context = {};
	context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
	'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
	context.scripts = ['calendarCreate.js', 'create.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
	'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
	res.render('create', context);
});


// Use this route to test locally without constantly re-deploying to Heroku
router.get('/create-test', async function (req, res, next) {
	req.session.onid = 'williaev';
	let context = {};
	context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
	'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
	context.scripts = ['calendarCreate.js', 'create.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
	'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
	res.render('create', context);
});

// Process event creation form
router.post('/create', async function (req, res, next) {
	// Get values from request
	let context = {};
	let slotArray = [];
	let eventName = req.body.eventName,
		defaultLocation = req.body.defaultLocation,
		defaultMaxAttendees = req.body.defaultMaxAttendees,
		maxResvPerAttendees = req.body.maxReservationsPerAttendee,
		description = req.body.description,
		visibility = req.body.attendeeNameVisibility,
		emails = req.body.emails,
		numSlots = req.body.numSlots;

	// Handle edge cases of 1 or 0 emails, convert to an array
	if (typeof emails === 'string') {
		emails = [emails];
	} else if (typeof email === 'undefined') {
		emails = [];
	}

	// Store Event info in database, record the new eventId
	let eventId = await event.createEvent(eventName, defaultLocation,
		defaultMaxAttendees, maxResvPerAttendees, description, visibility);

	// Store the event creator in the database
	await createsEvent.createCreatesEvent(eventId, req.session.onid);

	// Store the invitations (users emails) in the database
	await invitation.createInvitations(eventId, emails);


	// // TODO: handle time zone conversions
	// Process all slots
	let i = 0;
	let processedSlots = 0;
	while (processedSlots < numSlots) {
		if (req.body['slotStart' + i]) {
			let start = new Date(req.body['slotStart' + i]);	// start date/time
			let end = new Date(req.body['slotEnd' + i]);		// end date/time
			let duration = (end - start) / 60000;				// duration in minutes
			let location = req.body['slotLocation' + i];		// location

			if (location == '') {								// if not specified, use default
				location = defaultLocation;
			}

			let maxAttendees = req.body['slotMaxAttendees' + i];// maximum number of attendees
			if (maxAttendees == '') {							// if not specified, use default
				maxAttendees = defaultMaxAttendees;
			}

			let [date, time] = await helpers.parseDateTimeString(start);	//convert start date/time to MySQL-compatible format

			await slot.createSlot(eventId, location, date, time, duration, maxAttendees);	// Store slots in database

			processedSlots++;
		}
		i++;
	}
	res.redirect('/manage/' + eventId) + "/";
});

module.exports = router;