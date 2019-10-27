var express = 	require('express'),
	router = 	express.Router(),
	parser =	require('xml2json');
var mysql = require('./dbcon.js');

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
				ticket: validation_ticket,
				service: 'https://indaba-scheduler.herokuapp.com/'
			}
		};
		//TODO: Break code below up into functions, maybe a module?
		// Send validation request
		request(options, function(err, res, body) {
			//TODO: add error handling
			// Parse successful request
			let json = JSON.parse(parser.toJson(body));
			let attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
			let onid = attributes['cas:uid'];
			let firstName = attributes['cas:firstname'];
			let lastName = attributes['cas:lastname'];
			let fullName = attributes['cas:fullname'];
			let email = attributes['cas:email'];

			//TODO: find user's account id and set up their session

		});

		//TODO: change to a redirect instead of a render
		let context = {};
		context.stylesheets = ['main.css', 'home.css'];
		res.render('home');
	}
})

router.get('/test_OSU_Users',function(req, res){
  var context = {};
  /*mysql.pool.query('SELECT * FROM indaba_db.OSU_member', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.render('test_OSU_Users');
  });*/
	res.render('test_OSU_Users');
});

module.exports = router;
