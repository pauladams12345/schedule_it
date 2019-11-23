var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js');
	helpers = 		require('../helpers/helpers.js');

router.get('/make-reservations', async function (req, res, next) {

	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('../login');
	}

	// If there is a session, render users past reservations
	else {
		let context = {};

		//context.eventsManaging = await createsEvent.getUserEvents(req.session.onid);

		// Find all slots a user registered for in the past
		//let [reservations, fields] = await slot.findPastUserSlots(req.session.onid);

		// Process response from database into a handlebars-friendly format
		//context.eventsAttending = await helpers.processReservationsForDisplay(reservations, req.session.onid);

		//context.stylesheets = ['main.css', 'home.css']
		//res.render('past-reservations', context);
    context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
    '@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
    context.scripts = ['makeReservations.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
    '@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
    res.render('make-reservations', context);
	}
});

module.exports = router;
