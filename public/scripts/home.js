// Client-side JS for the home page

configureCancellations();

// Find all of "Cancel reservation" buttons and call their binding function
function configureCancellations(){
	document.addEventListener('DOMContentLoaded', function() {
		var buttons = document.getElementsByClassName('reservation-delete');
		for (var i = 0; i < buttons.length; i++) {
			var reservation = buttons[i].parentNode.parentNode.parentNode;
			var slotId = buttons[i].dataset.slotId;
			bindReservationDelete(buttons[i], reservation, slotId);
		}
	});
}

// When "Cancel reservation" button is clicked, send a post request to the server
// to delete the reservation, and remove the reservation from the DOM
function bindReservationDelete(button, reservation, slotId) {
  button.addEventListener('click', function(event) {
    // Send ajax request to delete reservation
    $.ajax({
      url : '/make-reservations/delete',
      type: 'POST',
      data: $.param({"slotId": slotId}),
      success: function(data) {
      	reservation.parentNode.removeChild(reservation);
      },
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });
}
