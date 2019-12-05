// Defines routes for the Mange Event page

var Router = 			require('express-promise-router'),
	router = 			new Router(),						// allows asynchronous route handlers
	session = 			require('express-session'),
	slot =				require('../models/slot.js'),
	event =				require('../models/event.js'),
	invitation =		require('../models/invitation.js'),
	createsEvent =		require('../models/createsEvent.js'),
	reserveSlot =		require('../models/reserveSlot.js'),
	email =				require('../helpers/email.js'),
	respondsToRequest = require('../models/respondsToRequest.js');

// Display the Manage Event page
router.get('/manage/:eventId', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('/login');
	}
	else {
		let eventId = req.params.eventId;

		// If this user is not an organizer for this event, redirect to the homepage
		let event_organizers = await createsEvent.getEventOrganizers(eventId);
		let is_organizer = false;
		for (let event_organizer of event_organizers) {
			if (event_organizer.organizer == req.session.onid) {
				is_organizer = true;
				break;
			}
		}
		if ( !is_organizer ) {
			res.redirect('/home');
		}

		// Gather event details to display
		else {
			let context = {};
			context.slotResv = await slot.eventSlotResv(eventId);
			context.attendees = await reserveSlot.getEventAttendees(eventId);
			helpers.combineDateAndTime(context.slotResv);
			context.eventDetails = await event.findEvent(eventId);
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
			context.scripts = ['manage.js', 'convertISOToLocal.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
			'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
			res.render('manage', context);
		}
	}
});

// Process reservation deletions
router.post('/manage/delete-reservation', async function (req, res, next) {
	let onid = req.body.onid;
	let slotId = req.body.slotId;
	await reserveSlot.deleteReservation(onid, slotId);
	res.send('Success');
});

// Process changes to an event's name
router.post('/manage/:eventId/edit-name', async function (req, res, next) {
	let eventId = req.params.eventId;
	let eventName = req.body.eventName;
	await event.editName(eventId, eventName);
	res.send('Success');
});

// Process changes to an event's description
router.post('/manage/:eventId/edit-description', async function (req, res, next) {
	let eventId = req.params.eventId;
	let description = req.body.description.substring(0,255);
	await event.editDescription(eventId, description);
	res.send('Success');
});

// Process changes to an event's maximum reservations
// This will not affect any existing reservations
router.post('/manage/:eventId/edit-max-reservations', async function (req, res, next) {
	let eventId = req.params.eventId;
	let maxReservations = req.body.maxReservationsPerAttendee;
	await event.editMaxResvPerAttendee(eventId, maxReservations);
	res.send('Success');
});

// Process changes to whether an events' attendees should be visible to others
router.post('/manage/:eventId/edit-visibility', async function (req, res, next) {
	let eventId = req.params.eventId;
	let visibility = req.body.attendeeNameVisibility;
	await event.editVisibility(eventId, visibility);
	res.send('Success');
});

// Delete an event
router.post('/manage/:eventId/delete-event', async function (req, res, next) {
	let slots = [];
	let eventId = req.params.eventId;
	await invitation.deleteInvitation(eventId);
	let eventSlots = await slot.findEventSlots(eventId);
	for (let slot of eventSlots){
		await reserveSlot.deleteAllReservations(slot.slot_id);
	}
	await createsEvent.removeUserFromCreatesEvent(eventId);
	await slot.deleteSlotByEventId(eventId);
	await respondsToRequest.deleteResponsesForEvent(eventId);
	await event.deleteEvent(eventId);
	res.redirect('/home');
});

// Send invitation emails
router.post('/manage/:eventId/send-invitations', async function (req, res, next) {
	let eventId = req.params.eventId;
	let emails = req.body.emails;

	// Handle edge cases of 1 or 0 emails, convert to an array
	if (typeof emails === 'string') {
		emails = [emails];
	} else if (typeof emails === 'undefined') {
		emails = [];
	}

	let organizerName = await event.getEventCreator(eventId);
	let eventName = req.body.eventName;
	let eventDescription = req.body.description;

	// Send invitation emails
	email.sendInvitationEmail(organizerName, eventName, eventDescription, eventId, emails);


	// Store the invitations (users emails) in the database
	await invitation.createInvitations(eventId, emails);

	res.send('Success');
});

// Process slot additions, deletions, or modifications
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
			let rows = await slot.findSlotAttendees(id);
			if (rows.length > 0) {
				modificationsAllowed = false;
				res.send("Error! You cannot delete a slot with active registrations. Delete these reservations below and try again.");
			}
		}
	}

	let lastSlotEndDate = null;		// track the ending date of the latest slot

	// Make all additions, modifications, and deletions requested by the user
	if (modificationsAllowed) {
		for (let id of slotIds) {
			let state = req.body['slotState' + id];

			// Skip over slots that are unused
			if (state == 'notUsed') {
				continue;
			}

			// Delete slot from database
			else if (state == 'existingDeleted') {
				slot.deleteSlot(id);
				continue;
			}

			// Check the ending date of slots that won't be modified
			else if (state == 'existingUnmodified') {
				let end = new Date(req.body['slotEnd' + id]);		// end date/time
				if (lastSlotEndDate < end) {						// check if this is the latest ending slot
					lastSlotEndDate = end;
				}
			}

			// Else slot is new or already exists and will be modified. Get details
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

			// Check if this is the latest ending slot
			if (lastSlotEndDate < end) {
				lastSlotEndDate = end;
			}

			// If new slot, create it
			if (req.body['slotState' + id] == 'new') {
				await slot.createSlot(eventId, location, startDate, // Store slots in database
				startTime, endTime, duration, maxAttendees);
			}
			// If existing slot, update its info
			else if (req.body['slotState' + id] == 'existingModified') {
				await slot.editSlot(location, startDate, startTime, endTime, duration, maxAttendees, id);
			}
		}

		// Set the expiration date to the end date of the latest slot
		if (lastSlotEndDate) {				// there is at least one slot and thus a latest ending time
			let [expirationDate, expirationTime] = await helpers.parseDateTimeString(lastSlotEndDate);
			await event.editExpirationDate(eventId, expirationDate);
		}
		else {								// there are no slots, so set expiration to null
			await event.nullifyExpirationDate(eventId);
		}


		res.send('Changes to time slots were successful.');
	}
});

// Process the "Manually make a reservation" form
router.post('/manage/:eventId/manual-reservation', async function (req, res, next) {
	let eventId = req.params.eventId;
	let onid = req.body.manualReservationONID;
	let slotId = req.body.manualReservationSlotId;
	if (onid && slotId){
		await reserveSlot.createReservation(onid, slotId);
	}
	res.send('Success');
});

module.exports = router;
