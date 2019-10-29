var express = 	require('express'),
	router = 	express.Router(),
	parser =	require('xml2json'),
	mysql = 	require('../middleware/dbcon.js'),
	request = 	require('request'),
	session = 	require('express-session');

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
				ticket: validation_ticket,
				service: 'https://indaba-scheduler.herokuapp.com/'
			}
		};
		//TODO: Break code below up into functions, maybe a module?
		// Send validation request
		request(options, function(err, response, body) {
			//TODO: add error handling
			// Parse successful request
			let json = JSON.parse(parser.toJson(body));
			let attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
			let onid = attributes['cas:uid'];
			let firstName = attributes['cas:firstname'];
			let lastName = attributes['cas:lastname'];
			let fullName = attributes['cas:fullname'];
			let email = attributes['cas:email'];

			//check if user with this email exists
			mysql.pool.query("SELECT * FROM `OSU_member` WHERE first_name = '" + firstName + "'", function(err, result){
				if(err){
					next(err);
					return;
				}
				// if yes, log them in
				else if (result.length > 0) {
					session.firstName = result[0].first_name;
					console.log("result[0]:" + JSON.stringify(result[0]));
					console.log("result[0].first_name: " + result[0].first_name);
					console.log("Branch 1:" + JSON.stringify(result));
				}
				//if no, add them to the database
				else {
					mysql.pool.query("INSERT INTO indaba_db.OSU_member (`first_name`,`last_name`, `ONID_email`) VALUES (?,?,?)",
					  [firstName, lastName, email], function(err, result){
						if(err){
								next(err);
								return;
						}
						console.log("Branch 2");
						session.firstName = firstName;
					});
				}
										//TODO: change to a redirect instead of a render
				let context = {};
				context.firstName = session.firstName;
				console.log("session.firstName: " + session.firstName);
				console.log("context.firstName: " + context.firstName);
				context.stylesheets = ['main.css', 'home.css'];
				res.render('home', context);
			});



			//TODO: find user's account id and set up their session

		});


	}
})






router.get('/home', function(req, res) {
	let context = {};
	context.stylesheets = ['main.css', 'home.css'];
	res.render('home', context);
})

router.get('/test_OSU_Users',function(req, res, next){
  var context = {};
  mysql.pool.query('SELECT * FROM indaba_db.OSU_member', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.send(context.results);
  });
});

router.get('/insert_user',function(req,res,next){
  var context = {};
	var firstName = "Fred";
	var lastName = "Sanford";
	var email = "fred.sanford@watts.com";
  mysql.pool.query("INSERT INTO indaba_db.OSU_member (`first_name`,`last_name`, `ONID_email`) VALUES (?,?,?)",
      [firstName,
       lastName,
       email],
       function(err, result){
           if(err){
               next(err);
               return;
         }
         context.results = "Inserted OSU Member ";
         res.send(context.results);
     });
});

module.exports = router;
