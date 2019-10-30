var Router =		require('express-promise-router')
	router = 		new Router(),		//lets you use async functions as route handlers
	parser =		require('xml2json'),
	dbcon = 		require('../middleware/dbcon.js'),
	request = 		require('request'),
	rp =			require('request-promise-native'),
	session = 		require('express-session'),
	sql =       	require('mysql2/promise');

// // Display landing page or authenticate user and redirect
// router.get('/not_in_use', function(req, res, next) {

// 	// If there's no CAS ticket in the query string, render the landing page
// 	if (!req.query.ticket) {
// 		let context = {}
// 		context.layout = 'no_navbar.handlebars'
// 		context.stylesheets = ['main.css', 'login.css']
// 		res.render('login', context);
// 	}

// 	// Otherwise, user has been redirected from CAS
// 	// Validate ticket, redirect to personal homepage
// 	else {
// 		// Get ticket ID
// 		let validation_ticket = req.query.ticket;

// 		// Set up ticket validation request to CAS
// 		let options = {
// 			method: 'GET',
// 			uri: 'https://login.oregonstate.edu/idp/profile/cas/serviceValidate',
// 			headers: {
// 				'Content-Type': 'text/xml'
// 			},
// 			qs: {
// 				ticket: validation_ticket,
// 				service: 'https://indaba-scheduler.herokuapp.com/'
// 			}
// 		};
// 		//TODO: Break code below up into functions, maybe a module?
// 		// Send validation request
// 		request(options, function(err, response, body) {
// 			//TODO: add error handling
// 			// Parse successful request
// 			let json = JSON.parse(parser.toJson(body));
// 			let attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
// 			let onid = attributes['cas:uid'];
// 			let firstName = attributes['cas:firstname'];
// 			let lastName = attributes['cas:lastname'];
// 			let fullName = attributes['cas:fullname'];
// 			let email = attributes['cas:email'];

// 			//check if user with this onid exists
// 			mysql.pool.query("SELECT * FROM `OSU_member` WHERE onid = '" + onid + "'", function(err, result){
// 				if(err){
// 					next(err);
// 					return;
// 				}
// 				// if yes, log them in
// 				else if (result.length > 0) {
// 					session.onid = result[0].onid;
// 					session.firstName = result[0].first_name;
// 				}
// 				//if no, add them to the database
// 				else {
// 					mysql.pool.query("INSERT INTO indaba_db.OSU_member (`onid`,`first_name`,`last_name`,`ONID_email`) VALUES (?,?,?,?)",
// 					  [onid, firstName, lastName, email], function(err, result){
// 						if(err){
// 								next(err);
// 								return;
// 						}
// 						session.firstName = firstName;
// 						session.onid = onid;
// 					});
// 				}
// 				//TODO: change to a redirect instead of a render
// 				let context = {};
// 				context.firstName = session.firstName;
// 				context.stylesheets = ['main.css', 'home.css'];
// 				res.render('home', context);
// 			});

// 		});
// 	}
// })


// Experiment with promises
router.get('/', async function (req, res, next) {

	// If there's no CAS ticket in the query string, render the landing page
	if (!req.query.ticket) {
		res.redirect('/login');
	}

	// Otherwise, user has been redirected from CAS
	// Validate ticket, redirect to personal homepage
	else {

		// Get ticket ID
		let cas_ticket = req.query.ticket;
		let attributes = await validateTicket(cas_ticket);
		req.session.onid = attributes.onid;
		req.session.firstName = attributes.firstName;
		
		await createUserIfNew(attributes);

		let context = {};
		context.onid = attributes.onid;
		context.firstName = firstName;
		res.render('home', context);
	}
})

// Send validation request to CAS server with ticket, get attributes from response
// TODO: handle errors
async function validateTicket(cas_ticket){
	try {

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
		const cas_info = await rp(options);

		let json = JSON.parse(parser.toJson(cas_info));
		let cas_attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
		
		let attributes = {};
		let attributes.onid = cas_attributes['cas:uid'];
		let attributes.firstName = cas_attributes['cas:firstname'];
		let attributes.lastName = cas_attributes['cas:lastname'];
		let attributes.fullName = cas_attributes['cas:fullname'];
		let attributes.email = cas_attributes['cas:email'];

		return attributes;
	} catch (err) {
		console.log(err);
	}
};

// Check if user exists in database. If not, create an entry.
async function createUserIfNew(attributes){
	try {
		const connection = await sql.createConnection(dbcon);
		const [rows, fields] = await connection.query("SELECT * FROM `OSU_member` WHERE onid = ?", [onid]);

		if (rows.length == 0) {
			const connection = await sql.createConnection(dbcon);
			await connection.query("INSERT INTO indaba_db.OSU_member (`onid`,`first_name`,`last_name`,`ONID_email`) VALUES (?,?,?,?)",
					  [attributes.onid, attributes.firstName, attributes.lastName, attributes.email]);
		}
	}
	catch (err){
		console.log(err);
	}
}

// async function findUser(req, request_options) {
// 	try {
// 		const cas_info = await rp(request_options);

// 		let json = JSON.parse(parser.toJson(cas_info));
// 		let attributes = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
// 		let onid = attributes['cas:uid'];
// 		let firstName = attributes['cas:firstname'];
// 		let lastName = attributes['cas:lastname'];
// 		let fullName = attributes['cas:fullname'];
// 		let email = attributes['cas:email'];
		
// 		const connection = await sql.createConnection(dbcon);
// 		const [rows, fields] = await connection.query("SELECT * FROM `OSU_member` WHERE onid = 'adamspa'");

// 		if (rows.length > 0) {
// 			req.session.firstName = rows[0].first_name;
// 			req.session.onid = rows[0].onid;
// 		}
// 		else {
// 			const connection = await sql.createConnection(dbcon);
// 			await connection.query("INSERT INTO indaba_db.OSU_member (`onid`,`first_name`,`last_name`,`ONID_email`) VALUES (?,?,?,?)",
// 					  [onid, firstName, lastName, email]);
// 			req.session.firstName = firstName;
// 			req.session.onid = onid;
// 		}

// 		let context = {};

// 		context.firstName = req.session.firstName;
// 		context.stylesheets = ['main.css', 'home.css'];
// 		return context;

// 	} catch (err) {
// 		console.log(err);
// 	}
// };


router.get('/home', async function (req, res, next) {
	// If there is no session established, redirect to the login page
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

//TODO: redirect to homepage if there's a session???
router.get('/login', async function (req, res, next) {
	let context = {};
	context.layout = 'no_navbar.handlebars';
	context.stylesheets = ['main.css', 'login.css'];
	res.render('login.handlebars', context);
});

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
