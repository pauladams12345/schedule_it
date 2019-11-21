var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js');

// TODO: restrict access to event creator
router.get('/manage/:eventId/', async function (req, res, next) {
	let eventId = req.params.eventId;
	let context = {};
	let [reservations, fields] = await slot.eventSlotResv(eventId);
	context.eventDetails = await event.findEvent(eventId);
	context.slotResv = reservations;

	let existingSlots = await slot.findEventSlots(eventId);
	for (let slot of existingSlots) {
		let startTime = new Date(slot.slot_date);												// get date of slot start
		startTime.setUTCHours(slot.start_time.substring(0,2), slot.start_time.substring(3,5));	// set time of slot start
		let endTime = new Date(startTime.getTime() + slot.duration * 60000);					// set date/time of slot end
		slot['start_time'] = startTime;
		slot['end_time'] = endTime;
	}
	context.existingSlots = existingSlots;

	context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
	'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
	context.scripts = ['calendarManage.js', 'manage.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
	'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
	res.render('manage', context);
});

router.post('/manage/:eventId/edit-name', async function (req, res, next) {
	let eventId = req.params.eventId;
	let eventName = req.body.eventName;
	await event.editName(eventId, eventName);
	res.send('Success');
});

router.post('/manage/:eventId/edit-description', async function (req, res, next) {
	let eventId = req.params.eventId;
	let description = req.body.description;
	await event.editDescription(eventId, description);
	res.send('Success');
});

router.post('/manage/:eventId/edit-max-reservations', async function (req, res, next) {
	let eventId = req.params.eventId;
	let maxReservations = req.body.maxReservationsPerAttendee;
	await event.editMaxResvPerAttendee(eventId, maxReservations);
	res.send('Success');
});

router.post('/manage/:eventId/edit-visibility', async function (req, res, next) {
	let eventId = req.params.eventId;
	let visibility = req.body.attendeeNameVisibility;
	await event.editVisibility(eventId, visibility);
	res.send('Success');
});

router.post('/manage/:eventId/edit-slots', async function (req, res, next) {
	let eventId = req.params.eventId;
	console.log(req.body);
	res.send('Success');
})

module.exports = router;