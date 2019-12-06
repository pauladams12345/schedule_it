// Defines routes for the Make Reservations page

var Router = 		require('express-promise-router'),
	router = 		new Router(),						// allows asynchronous route handlers
	session = 		require('express-session'),
	reserveSlot =   require('../models/reserveSlot.js');
	slot =			require('../models/slot.js'),
	event =			require('../models/event.js'),
	invitation =	require('../models/invitation.js'),
	createsEvent =	require('../models/createsEvent.js'),
	respondsToRequest =    require('../models/respondsToRequest.js'),
	helpers = 		require('../helpers/helpers.js');

// Displays "Make a reservation" page for the given event
router.get('/make-reservations/:eventId', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		req.session.eventId = req.params.eventId;	// Store the event the user wishes to register for so they can get back to this page
		res.redirect('/login');
	}

	// If there is a session, render users past reservations
	else {
		let context = {};
		let onid = req.session.onid;
		eventId = req.params.eventId;

		context.eventDetails = await event.findEvent(eventId);
		context.eventCreator = await event.getEventCreator(eventId);
		context.numUserReservations = await reserveSlot.getNumUserReservations(onid, eventId);
		let eventSlots = await slot.findEventSlots(eventId);
		for (let slot of eventSlots) {
			let startTime = new Date(slot.slot_date);												// get date of slot start
			startTime.setUTCHours(slot.start_time.substring(0,2), slot.start_time.substring(3,5));	// set time of slot start
			let endTime = new Date(startTime.getTime() + slot.duration * 60000);					// set date/time of slot end
			slot['start_time'] = startTime;
			slot['end_time'] = endTime;
		}
		context.userSlots = await reserveSlot.getSlotIdsByUserAndEvent(onid, eventId);
		context.existingSlots = await helpers.processEventSlots(eventSlots, eventId);

		context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
		'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
		context.scripts = ['make-reservations.js', 'convertISOToLocal.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
		'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
		res.render('make-reservations', context);
	}
});

// Process the submitted form to make new reservations
router.post('/make-reservations', async function (req, res, next) {
	if (!req.session.onid) {
		res.redirect('../login');
	}
	else{
		let context = {};
		let slotIds = req.body.resvSlotId;
		let onid = req.session.onid;
		let attending = req.body.attend;
		let eventId = req.body.eventId;
		let existingResponse = await respondsToRequest.getResponse(onid, eventId);

		// Handle edge cases of 1 or 0 emails, convert to an array
		if (typeof slotIds === 'string') {
			slotIds = [slotIds];
		} else if (typeof slotIds === 'undefined') {
			slotIds = [];
		}

		// User is not attending, set their response in Responds_To_Request table
		if (existingResponse.length == 0 && attending === 'no' && slotIds.length == 0){
			await respondsToRequest.createResponse(onid, eventId, 0);
		}
		// User is attending
		else {  
			// Loop through slots and create reservations
			for(let slot of slotIds){
				await reserveSlot.createReservation(onid, slot);
			}
			// Set response in Responds_To_Request table
			if (existingResponse.length == 0) {							// first reservation
				await respondsToRequest.createResponse(onid, eventId, 1);
			}
			else if (existingResponse[0].attending == 0) {							// previously responded "not attending"
				await respondsToRequest.updateResponse(onid, eventId, 1);
			}
		}
		res.redirect('/home');
	}
});

// Delete the specified reservation from the Reserve_Slot table
router.post('/make-reservations/delete', async function (req, res, next) {
	let onid = req.session.onid;
	let slotId = req.body.slotId;
	let slotInfo = await slot.findSlot(slotId);
	let eventId = slotInfo.fk_event_id;
	await reserveSlot.deleteReservation(onid, slotId);

	// See if user has any other reservations for this event
	let reservations = await reserveSlot.getNumUserReservations(onid, eventId);
	if (reservations == 0) {
		respondsToRequest.updateResponse(onid, eventId, 0);
	}
	res.send('Success');
});

module.exports = router;
