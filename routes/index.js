var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js')
	helpers = 		require('../helpers/helpers.js');

// Redirects new arrivals to landing page. Handles authentication
// for users redirected from CAS login then redirects to personal homepage
router.get('/', async function (req, res, next) {

	// If there's no CAS ticket in the query string, redirect to the landing page
	if (!req.query.ticket) {
		res.redirect('/login');
	}

	// Otherwise, user has been redirected from CAS
	// Validate ticket, redirect to personal homepage
	else {

		// Get ticket from query string
		let cas_ticket = req.query.ticket;

		// Validate ticket and get user's attributes
		let attributes = await helpers.validateTicket(cas_ticket);

		// Store user's name and onid in the session
		req.session.onid = attributes.onid;
		req.session.firstName = attributes.firstName;

		// If new user, store in database
		await helpers.createUserIfNew(attributes);

		// Redirect to homepage
		res.redirect('/home');
	}
});

// Displays user's personal homepage
router.get('/home', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('../login');
	}
	// If there is a session, render user's homepage
	else {
		let context = {};

		context.eventsManaging = await createsEvent.getUserEvents('adamspa');

		// Find all slots a user is registered for
		let [reservations, fields] = await slot.findUserSlots(req.session.onid);

		// Process response from database into a handlebars-friendly format
		context.eventsAttending = await helpers.processReservationsForDisplay(reservations, req.session.onid);

		context.firstName = req.session.firstName;
		context.stylesheets = ['main.css', 'home.css'];
		res.render('home', context);
	}

});

// Displays landing page
// TODO: redirect to homepage if there's a session???
router.get('/login', async function (req, res, next) {
	let context = {};
	context.layout = 'no_navbar.handlebars';
	context.stylesheets = ['main.css', 'login.css'];
	res.render('login.handlebars', context);
});

// Destroys current session and redirects to landing page
router.get('/logout', async function (req, res, next) {
	if (req.session) {
		req.session.destroy(function(err) {
			if(err){
				return next(err);
			}
			else {
				return res.redirect('/');
			}
		});
	}
});

// Displays "Create New Event" page
router.get('/create', async function (req, res, next) {
	let context = {};
	context.stylesheets = ['main.css', 'login.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
	'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
	context.scripts = ['calendar.js', 'create.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
	'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
	res.render('create', context);
});

// Displays "Manage Event" page
router.get('/manage', async function (req, res, next) {
	let context = {};
	context.stylesheets = ['main.css', 'login.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
	'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
	context.scripts = ['calendar.js', 'create.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
	'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
	res.render('manage', context);
});

// Use this route to test locally without constantly re-deploying to Heroku
router.get('/create-test', async function (req, res, next) {
	req.session.onid = 'williaev';
	let context = {};
	context.stylesheets = ['main.css', 'login.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
	'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
	context.scripts = ['calendar.js', 'create.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
	'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
	res.render('create', context);
});

// Process event creation form
router.post('/create', async function (req, res, next) {
	// Get values from request
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

	// Redirect user to their manage event page
	res.redirect('/manage');
});




module.exports = router;
