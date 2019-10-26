var express = 	require('express'),
	router = 	express.Router(),
	parser =	require('xml2json');

// For pages other than the landing page, include a line
// like the following:
// router.use('/preferences', require('./preferences'));

// Route for landing page
router.get('/login', function(req, res) {
	var context = {};
	context.layout = 'no_navbar.handlebars'
	context.stylesheets = ['main.css', 'login.css']
	res.render('login', context);
});

router.get('/', function(req, res) {
	var context = {};
	var validation_ticket = req.query.ticket;
	console.log('Ticket: ' + validation_ticket);

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

	request(options, function(err, res, body) {
		console.log('BODY:\n\n\n' + body);
		var json = JSON.parse(parser.toJson(body));
		str = JSON.stringify(json);
		console.log(str);
		var attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
		str2 = JSON.stringify(attributes);
		console.log(str2);
		var onid = attributes['cas:uid'];
		var firstName = attributes['cas:firstname'];
		var lastName = attributes['cas:lastname'];
		var fullName = attributes['cas:fullname'];
		var email = attributes['cas:email'];
		console.log(onid);
		console.log(firstName);
		console.log(lastName);
		console.log(fullName);
		console.log(email);
	});

	res.render('home', context);
})

module.exports = router;