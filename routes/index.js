var express = 	require('express'),
	router = 	express.Router();

// For pages other than the landing page, include a line
// like the following:
// router.use('/preferences', require('./preferences'));

// Route for landing page
router.get('/login', function(req, res) {
	var context = {};
	context.layout = "no_navbar.handlebars"
	context.stylesheets = ["main.css", "login.css"]
	res.render('login', context);
});

module.exports = router;