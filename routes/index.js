var express = 	require('express'),
	router = 	express.Router(),
	parser =	require('xml2json');

// For pages other than the landing page, include a line
// like the following:
// router.use('/preferences', require('./preferences'));

// Route for landing page
// router.get('/login', function(req, res) {
// 	var context = {};
// 	context.layout = 'no_navbar.handlebars'
// 	context.stylesheets = ['main.css', 'login.css']
// 	res.render('login', context);
// });

router.get('/', function(req, res) {
	var context = {};

	// If there's no CAS ticket in the query string, render the landing page
	if (!req.query.ticket) {
		context.layout = 'no_navbar.handlebars'
		context.stylesheets = ['main.css', 'login.css']
		res.render('login', context);
	}

	// Otherwise, user has been redirected from CAS, render personal homepage
	else {
		// Get ticket ID
		var validation_ticket = req.query.ticket;

		// Set up ticket validation request to CAS
		var options = {
			method: 'GET',
			uri: 'https://login.oregonstate.edu/idp/profile/cas/serviceValidate',
			headers: {
				'Content-Type': 'text/xml'
			},
			qs: {
				ticket: validation_ticket,
				service: 'https://indaba-scheduler.herokuapp.com/'
			}
		};

		// Send validation request
		request(options, function(err, res, body) {
			// Parse successful request
			var json = JSON.parse(parser.toJson(body));
			var attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
			var onid = attributes['cas:uid'];
			var firstName = attributes['cas:firstname'];
			var lastName = attributes['cas:lastname'];
			var fullName = attributes['cas:fullname'];
			var email = attributes['cas:email'];
		});

		res.render('home', context);
	}
})

module.exports = router;