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
    context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
    '@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
    context.scripts = ['@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
    '@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
    //res.render('make-reservations', context);
		res.send('success');
	}
});

module.exports = router;
