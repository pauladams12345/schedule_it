$.ajax({
  type: 'GET',
  url: '/get-past-reservations',
  success: function(resp) {
  	var reservations = JSON.parse(resp);
  	console.log(reservations);
  	var event_ids = [];

  	for (var resv of reservations) {
  		var id = resv.event_id;

  		// If we haven't seen this event, create a new event div
  		if (!event_ids.includes(id)) {
			var eventDiv = document.createElement('div');
	  		eventDiv.setAttribute('class', 'reservation-display mb-4 ml-2 w-auto');
	  		eventDiv.setAttribute('id', 'event' + id)

	  		var title = document.createElement('h3');
	  		title.textContent = resv.event_name;
	  		var creator = document.createElement('p');
	  		creator.textContent = 'Created by: ' + id;
	  		var description = document.createElement('p');
	  		description.textContent = 'Description: ' + resv.description;
	  		var slotHeader = document.createElement('h5');
	  		slotHeader.textContent = 'Your Reservation(s):';

			//  Create a nested  object for the current reservation
			let dateTime = new Date(resv.slot_date + 'T' + resv.start_time);
			let dateString = dateTime.toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric' , year: 'numeric'});
			let timeString = dateTime.toLocaleTimeString('en-US') + ' - ';
			timeString += new Date(dateTime.getTime() + resv.duration * 60000).toLocaleTimeString('en-US');

	  		var slotRow = document.createElement('div');
	  		slotRow.setAttribute('class', 'row');
	  		slotRow.setAttribute('style', 'padding-left: 3rem');

	  		var slotCol1 = document.createElement('div');
	  		slotCol1.setAttribute('class', 'col-12 col-sm-5 col-md-4 col-lg-3');
	  		var date = document.createElement('p');
	  		date.setAttribute('class', 'mb-0');
	  		date.textContent = timeString;

	  		slotCol1.appendChild(date);

	  		var slotCol2 = document.createElement('div');
	  		slotCol2.setAttribute('class', 'col-12 col-sm-7 col-md-8 col-lg-9');

	  		slotRow.appendChild(slotCol1);
	  		slotRow.appendChild(slotCol2);	

	  		eventDiv.appendChild(title);
  			eventDiv.appendChild(creator);
  			eventDiv.appendChild(description);
  			eventDiv.appendChild(slotHeader);
	  		eventDiv.appendChild(slotRow);

  			document.getElementById('body').appendChild(eventDiv);
  		}

  	}
  	// for (var event of events) {
  	
  		
  	
  		
  	// }
  },
  error: function() {
  	console.log('Error in ajax request');
  }
});

// {"175":{
// 	"title":"Old Event",
// 	"creator":"Paul Adams",
// 	"description":"This is in the past",
// 	"reservations":{
// 		"453":{
// 			"date":"Monday, Nov 11, 2019",
// 			"time":"2:00:00 PM - 3:00:00 PM",
// 			"location":"Cafeteria",
// 			"attendees":{
// 				"williaev":{
// 					"firstName":"Everett",
// 					"lastName":"Williams",
// 					"email":"williaev@oregonstate.edu"}
// 				}
// 			}
// 		}
// 	}
// }