var express = 	require('express'),
	router = 	express.Router(),
	parser =	require('xml2json');

// Display landing page or authenticate user and redirect
router.get('/', function(req, res) {

	// If there's no CAS ticket in the query string, render the landing page
	if (!req.query.ticket) {
		let context = {}
		context.layout = 'no_navbar.handlebars'
		context.stylesheets = ['main.css', 'login.css']
		res.render('login', context);
	}

	// Otherwise, user has been redirected from CAS
	// Validate ticket, redirect to personal homepage
	else {
		// Get ticket ID
		let validation_ticket = req.query.ticket;

		// Set up ticket validation request to CAS
		let options = {
			method: 'GET',
			uri: 'https://login.oregonstate.edu/idp/profile/cas/serviceValidate',
			headers: {
				'Content-Type': 'text/xml'
			},
			qs: {
				ticket: "THISWONTWORK",
				service: 'https://indaba-scheduler.herokuapp.com/'
			}
		};
		//TODO: Break code below up into functions, maybe a module?
		// Send validation request
		function extractAttributes(err, res, body) {
			//TODO: add error handling
			// Parse successful request
			if (err) {
				next(err)		// pass errors to Express
			}
			else {


				// Convert XML response to JSON, extract attributes
				let json = JSON.parse(parser.toJson(body));
				let attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
				let onid = attributes['cas:uid'];
				let firstName = attributes['cas:firstname'];
				let lastName = attributes['cas:lastname'];
				let fullName = attributes['cas:fullname'];
				let email = attributes['cas:email'];

				console.log("onid: " + onid);
				console.log("firstName: " + firstName);
				console.log("lastName: " + lastName);
				console.log("fullName: " + fullName);
				console.log("email: " + email);

				//TODO: find user's account id and set up their session
			}
		};

		request(options, extractAttributes);

		//TODO: change to a redirect instead of a render
		let context = {};
		context.stylesheets = ['main.css', 'home.css'];
		res.render('home');	
	}
})

module.exports = router;