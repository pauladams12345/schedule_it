var express = 			require('express'),
	router = 			express.Router(),
	parser =			require('xml2json'),
	request_helpers = 	require('../middleware/request_helpers.js');

// Display landing page or authenticate user and redirect
router.get('/', function(req, res, next) {

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
				ticket: "validation_ticket",
				service: 'https://indaba-scheduler.herokuapp.com/'
			}
		};
		//TODO: Break code below up into functions, maybe a module?
		// Send validation request


		let attributes = request(options, request_helpers.extractAttributes);
		console.log(attributes);

		//TODO: change to a redirect instead of a render
		let context = {};
		context.stylesheets = ['main.css', 'home.css'];
		res.render('home');	
	}
})

module.exports = router;