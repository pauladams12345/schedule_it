var express = 	require('express'),
	router = 	express.Router();

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
	});

	res.render('home', context);
})

module.exports = router;