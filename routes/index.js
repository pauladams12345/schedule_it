var express = 	require('express'),
	router = 	express.Router();

// For pages other than the landing page, include a line
// like the following:
// router.use('/preferences', require('./preferences'));

// Route for landing page
router.get('/', function(req, res) {
	res.render('login');
});

module.exports = router;