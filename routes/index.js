var Router = 	require('express-promise-router'),
	router = 	new Router(),						// allows asynchronous route handlers
	parser =	require('xml2json'),
	rp = 		require('request-promise-native'),
	session = 	require('express-session'),
	user =		require('../models/user.js');

// Redirects new arrivals to landing page. Handles authentication
// for users redirected from CAS login then redirects to personal homepage
router.get('/', async function (req, res, next) {

	// If there's no CAS ticket in the query string, render the landing page
	if (!req.query.ticket) {
		res.redirect('/login');
	}

	// Otherwise, user has been redirected from CAS
	// Validate ticket, redirect to personal homepage
	else {

		// Get ticket from query string
		let cas_ticket = req.query.ticket;

		// Validate ticket and get user's attributes
		let attributes = await validateTicket(cas_ticket);

		// Store user's name and onid in the session
		req.session.onid = attributes.onid;
		req.session.firstName = attributes.firstName;
		
		// If new user, store in database
		await createUserIfNew(attributes);

		// Redirect to homepage
		res.redirect('/home');
	}
})

// Displays user's personal homepage
router.get('/home', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('../login');
	}
	// If there is a session, render user's homepage
	else {
		let context = {};
		context.firstName = req.session.firstName;
		context.stylesheets = ['main.css', 'login.css'];
		res.render('home', context);
	}

});

// Displays landing page
//TODO: redirect to homepage if there's a session???
router.get('/login', async function (req, res, next) {
	let context = {};
	context.layout = 'no_navbar.handlebars';
	context.stylesheets = ['main.css', 'login.css'];
	res.render('login.handlebars', context);
});

// Send validation request to CAS server with ticket, return attributes from response
// TODO: handle errors
async function validateTicket(cas_ticket){
	try {

		// Options for the CAS validation request
		let options = {
			method: 'GET',
			uri: 'https://login.oregonstate.edu/idp/profile/cas/serviceValidate',
			headers: {
				'Content-Type': 'text/xml'
			},
			qs: {
				ticket: cas_ticket,
				service: 'https://indaba-scheduler.herokuapp.com/'
			}
		};

		// Validate ticket
		const cas_info = await rp(options);

		// Parse results from validation, converting from XML to JSON
		let json = JSON.parse(parser.toJson(cas_info));
		let cas_attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
		
		// Extract user's attributes
		let attributes = {};
		attributes.onid = cas_attributes['cas:uid'];
		attributes.firstName = cas_attributes['cas:firstname'];
		attributes.lastName = cas_attributes['cas:lastname'];
		attributes.fullName = cas_attributes['cas:fullname'];
		attributes.email = cas_attributes['cas:email'];

		// Return user's attributes
		return attributes;
	} 
	catch (err) {
		console.log(err);
	}
};

// Check if user exists in database. If not, create an entry.
async function createUserIfNew(attributes){
	try {
		const [rows, fields] = await user.findUser(attributes.onid);
		if (rows.length == 0) {
			await user.createUser(attributes.onid, attributes.firstName, attributes.lastName, attributes.email);
		}
	}
	catch (err){
		console.log(err);
	}
}

module.exports = router;
