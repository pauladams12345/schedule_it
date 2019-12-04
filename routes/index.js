// Defines routes for login, logout, and homepage

var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js'),
	helpers = 		require('../helpers/helpers.js'),
	email =			require('../helpers/email.js');

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

		// If the user was trying to reserve a time slot, redirect them to that page
		if (req.session.eventId) {
			res.redirect('/make-reservations/' + req.session.eventId);
			delete req.session['eventId'];
		}

		// Otherwise, redirect them to the homepage
		else {
			res.redirect('/home');
		}
	}
});

// Displays user's personal homepage
router.get('/home', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('/login');
	}
	// If there is a session, render user's homepage
	else {
		let context = {};
		context.eventsManaging = await createsEvent.getUpcomingUserEvents(req.session.onid);
		context.eventsAttending = await helpers.processUpcomingReservationsForDisplay(req.session.onid);
		context.firstName = req.session.firstName;
		context.stylesheets = ['main.css'];
		context.scripts = ['convertISOToLocal.js', 'home.js'];
		res.render('home', context);
	}

});

// Development route for local testing
router.get('/home-test', async function (req, res, next) {
	req.session.onid = 'adamspa';
	req.session.firstName = 'Paul';
	let context = {};
	context.eventsManaging = await createsEvent.getUpcomingUserEvents(req.session.onid);
	context.eventsAttending = await helpers.processUpcomingReservationsForDisplay(req.session.onid);
	context.firstName = req.session.firstName;
	context.stylesheets = ['main.css'];
	context.scripts = ['convertISOToLocal.js', 'home.js'];
	res.render('home', context);
});

// Displays landing page
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

module.exports = router;
