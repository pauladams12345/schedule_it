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


router.get('/make-reservations/:eventId', async function (req, res, next) {
	// If there is no session established, redirect to the landing page
	if (!req.session.onid) {
		res.redirect('../login');
	}

	// If there is a session, render users past reservations
	else {
		let context = {};
		let onid = req.session.onid;
		eventId = req.params.eventId;

		context.eventDetails = await event.findEvent(eventId);
		context.eventCreator = await event.getEventCreator(eventId);
		let [slots, fields] = await slot.findUserSlots(onid);
		let eventSlots = await slot.findEventSlots(eventId);
		for (let slot of eventSlots) {
			let startTime = new Date(slot.slot_date);												// get date of slot start
			startTime.setUTCHours(slot.start_time.substring(0,2), slot.start_time.substring(3,5));	// set time of slot start
			let endTime = new Date(startTime.getTime() + slot.duration * 60000);					// set date/time of slot end
			slot['start_time'] = startTime;
			slot['end_time'] = endTime;
		}
		context.userSlots = await helpers.processUserSlots(slots);
		context.existingSlots = await helpers.processEventSlots(eventSlots, eventId);

		context.stylesheets = ['main.css', 'calendar.css', '@fullcalendar/core/main.css', '@fullcalendar/daygrid/main.css',
		'@fullcalendar/timegrid/main.css', '@fullcalendar/bootstrap/main.css'];
		context.scripts = ['calendarReservation.js', '@fullcalendar/core/main.js', '@fullcalendar/daygrid/main.js',
		'@fullcalendar/timegrid/main.js', '@fullcalendar/bootstrap/main.js', '@fullcalendar/interaction/main.js'];
		res.render('make-reservations', context);
	}
});

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
		if (attending === 'no'){  //if not attending only update respondsToRequest with 0
			await respondsToRequest.setRequest(onid, eventId, 0);
		}
		else{  // if attending update respondsToRequest with 1 and update associated slots
			// Handle edge cases of 1 or 0 emails, convert to an array
			if (typeof slotIds === 'string') {
				slotIds = [slotIds];
			} else if (typeof slotIds === 'undefined') {
				slotIds = [];
			}
			//loop through slots and create reservations
			for(let slot of slotIds){
				await reserveSlot.createReservation(onid, slot);
				await respondsToRequest.setRequest(onid, eventId, 1);
			}
		}
		res.redirect('/home');
	}
});

module.exports = router;
