var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js'),
	reserveSlot =	require('../models/reserveSlot.js');

// TODO: restrict access to event creator
router.get('/manage/:eventId/', async function (req, res, next) {
	let eventId = req.params.eventId;
	let context = {};
	let [reservations, fields] = await slot.eventSlotResv(eventId);
	context.eventDetails = await event.findEvent(eventId);
	context.slotResv = reservations;
	context.invitations = await invitation.findEventInvitations(eventId);

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

router.post('/manage/delete-reservation/', async function (req, res, next) {
	let onid = req.body.onid;
	let slotId = req.body.slotId;
	await reserveSlot.deleteReservation(onid, slotId);
	res.send('Success');
});

router.post('/manage/:eventId/edit-name', async function (req, res, next) {
	let eventId = req.params.eventId;
	let eventName = req.body.eventName;
	await event.editName(eventId, eventName);
	res.send('Success');
});

router.post('/manage/:eventId/edit-description', async function (req, res, next) {
	console.log("test");
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

router.post('/manage/:eventId/delete-event', async function (req, res, next) {
	console.log("test");
	//let eventId = req.params.eventId;
	//let description = req.body.description;
	//await event.editDescription(eventId, description);
	res.send('Success');
/*console.log("test");
	let slots = [];
	let eventId = req.params.eventId;
	await invitation.deleteInvitation(eventId);
	let eventSlots = await slot.findEventSlots(eventId);
	for (let slot of eventSlots){
		await deleteReservedSlotReservations(slot.slot_id);
	}
	await slot.deleteSlotByEventId(eventId);
	await event.deleteEvent(eventId);
	context.stylesheets = ['main.css', 'home.css'];
	res.render('home', context);*/
});

router.post('/manage/:eventId/send-invitations', async function (req, res, next) {
	let eventId = req.params.eventId;
	let emails = req.body.emails;

	// Handle edge cases of 1 or 0 emails, convert to an array
	if (typeof emails === 'string') {
		emails = [emails];
	} else if (typeof email === 'undefined') {
		emails = [];
	}

	// Store the invitations (users emails) in the database
	await invitation.createInvitations(eventId, emails);

	res.send('Success');
});

router.post('/manage/:eventId/edit-slots', async function (req, res, next) {
	// Get values from request
	let context = {};
	let eventId = req.params.eventId;
	let defaultLocation = req.body.defaultLocation;
	let defaultMaxAttendees = req.body.defaultMaxAttendees;
	let slotIds = req.body.slotIds;

	if (slotIds.length > 0) {
		slotIds = slotIds.split(',');
	}

	// Check if user requested to delete a slot with reservations
	// If yes, send an error message and don't proceed with requested modifications
	let modificationsAllowed = true;
	for (let id of slotIds) {
		let state = req.body['slotState' + id];
		if (state == 'existingDeleted') {
			let [rows, fields] = await slot.findSlotAttendees(id);
			if (rows.length > 0) {
				modificationsAllowed = false;
				res.send("Error! You cannot delete a slot with active registrations. Delete these reservations below and try again.");
			}
		}
	}

	// Make all additions, modifications, and deletions requested by the user
	if (modificationsAllowed) {
		for (let id of slotIds) {
			let state = req.body['slotState' + id];

			// Skip over slots that are unused or unmodified
			if (state == 'notUsed' || state == 'existingUnmodified') {
				continue;
			}

			// Delete slot from database
			else if (state == 'existingDeleted') {
				slot.deleteSlot(id);
				continue;
			}

			// Get slot info
			let start = new Date(req.body['slotStart' + id]);	// start date/time
			let end = new Date(req.body['slotEnd' + id]);		// end date/time
			let duration = (end - start) / 60000;				// duration in minutes
			let location = req.body['slotLocation' + id];		// location
			let maxAttendees = req.body['slotMaxAttendees' + id];// maximum number of attendees
			if (location == '') {								// if not specified, use default
				location = defaultLocation;
			}
			if (maxAttendees == '') {							// if not specified, use default
				maxAttendees = defaultMaxAttendees;
			}
			let [startDate, startTime] = await helpers.parseDateTimeString(start);	//convert start date/time to MySQL-compatible format
			let [endDate, endTime] = await helpers.parseDateTimeString(end);			//convert end date/time to MySQL-compatible format

			// If new slot, create it
			if (req.body['slotState' + id] == 'new') {
				await slot.createSlot(eventId, location, startDate, startTime, endTime, duration, maxAttendees);	// Store slots in database
			}
			// If existing slot, update its info
			else if (req.body['slotState' + id] == 'existingModified') {
				await slot.editSlot(location, startDate, startTime, endTime, duration, maxAttendees, id);
			}
		}
		res.send('Changes to time slots were successful.');
	}
});

module.exports = router;
