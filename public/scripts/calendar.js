// TODO: figure out how to handle slot ID assignment on Manage Event
// Maybe pick a random starting value tied to the date/time? Want to
// avoid overlap.
//Script to create and manipulate the calendar on the create event page
document.addEventListener('DOMContentLoaded', function() {
  dateFormat = {}
  var context = {};
  var startTime;
  var endTime;
  var numSlots = 0;
  var max_attendees;
  var calendarEl = document.getElementById('calendar');
  var modal = document.getElementById('exampleModal');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'bootstrap' ],
    themeSystem: 'bootstrap',
    defaultView: 'timeGridWeek',
    slotDuration: '00:30',
    snapDuration: '00:15',
    //slotLabelInterval: '01:00:00',
    editable: true,
    selectable: true,
    eventLimit : true,
    longPressDelay: 0,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    eventTimeFormat: { // 07:30p.m.
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    // Upon clicking an empty spot on calendar, create new slot using defaults
    select: function(info) {
      var slotId = numSlots;
      numSlots++;
      var hours = parseInt(document.getElementById('defaultDurationHours').value, 10);
      var minutes = parseInt(document.getElementById('defaultDurationMinutes').value, 10);
      var duration = (60 * hours) + minutes;
      info.end.setTime(info.start.getTime() + duration * 60000);
      var calenderEvent = calendar.addEvent({id: slotId, start: info.start, end: info.end});
      appendSlot(info.startStr, info.endStr, slotId, calenderEvent, duration);//appendSlot(info.start, info.end, slotId, calenderEvent);
    },
    // Upon clicking an existing slot, show the modal to edit details
    eventClick: function(clickInfo) {
      var slotId = clickInfo.event.id;
      var slot = document.getElementById('slot' + slotId);
      var location = document.getElementById('slotLocation' + slotId);
      var maxAttendees = document.getElementById('slotMaxAttendees' + slotId);
      location.placeholder = document.getElementById('defaultLocation').value;
      maxAttendees.placeholder = document.getElementById('defaultMaxAttendees').value;
      slot.hidden = false;
      var saveButton = document.getElementById('modalSave');
      saveButton.addEventListener('click', function(event) {
        slot.hidden = true;
      });
      $('#addEventSlot').modal('show');
    },
    // Upon dragging and dropping an event, update the start and end times
    eventDrop: function(dropInfo) {
      var startInput = document.getElementById("slotStart" + dropInfo.event.id);
      var endInput = document.getElementById("slotEnd" + dropInfo.event.id);
      startInput.value = dropInfo.event.start;
      endInput.value = dropInfo.event.end;
    },
    // Upon resizing an event, update the end time
    eventResize: function(resizeInfo) {
      var endInput = document.getElementById("slotEnd" + resizeInfo.event.id);
      endInput.value = resizeInfo.event.end;
    }
  });
  calendar.render();
});

// Creates inputs for start time, end time, location, and maxAttendees
// for a new slot and appends to the modal. Hidden by default.
function appendSlot(startTime, endTime, slotId, calenderEvent, slotDuration) {
  var slot = document.createElement('div');
  slot.setAttribute('id', 'slot' + slotId);

  // Event start time (remains hidden)
  var start = document.createElement('input');
  start.setAttribute('type', 'text');
  start.setAttribute('name', 'slotStartTime');  //start.setAttribute('name', 'slot' + slotId);
  start.setAttribute('id', 'slotStart' + slotId);
  start.value = startTime;
  start.hidden = true;

  // Event end time (remains hidden)
  var end = document.createElement('input');
  end.setAttribute('type', 'text');
  end.setAttribute('name', 'slotEndTime');  //end.setAttribute('name', 'slot' + slotId);
  end.setAttribute('id', 'slotEnd' + slotId);
  end.value = endTime;
  end.hidden = true;

  // Event duration (remains hidden)
  // Ensures only one input is created otherwise will have parsing issuses in index.js
  console.log(document.getElementsByName('slotDuration').length);
  if (document.getElementsByName('slotDuration').length === 0){
    //console.log(document.getElementsByName('slotDuration').length);
    var duration = document.createElement('input');
    duration.setAttribute('type', 'text');
    duration.setAttribute('name', 'slotDuration');  //end.setAttribute('name', 'slot' + slotId);
    duration.setAttribute('id', 'slotEnd' + slotId);
    duration.value = slotDuration;
    duration.hidden = true;
  };

  // Slot location. Defaults to null. Will be replaced with defaultLocation
  // upon form submission if not explicitly specified.
  var location = document.createElement('input');
  location.setAttribute('type', 'text');
  location.setAttribute('class', 'form-control')
  location.setAttribute('name', 'slot' + slotId);
  location.setAttribute('id', 'slotLocation' + slotId);

  // Label for location input
  var locationLabel = document.createElement('label');
  locationLabel.setAttribute('for', 'slotLocation' + slotId);
  locationLabel.setAttribute('class', 'col-form-label');
  locationLabel.textContent = "Location";

  // Slot max attendees. Defaults to null. Will be replaced by defaultMaxAttendees
  // upon form submission if not explicitly specified
  var maxAttendees = document.createElement('input');
  maxAttendees.setAttribute('type', 'number');
  maxAttendees.setAttribute('class', 'form-control');
  maxAttendees.setAttribute('name', 'slot' + slotId);
  maxAttendees.setAttribute('id', 'slotMaxAttendees' + slotId);

  // Label for max attendees input
  var maxAttendeesLabel = document.createElement('label');
  maxAttendeesLabel.setAttribute('for', 'slotMaxAttendees' + slotId);
  maxAttendeesLabel.setAttribute('class', 'col-form-label');
  maxAttendeesLabel.textContent = "Max attendees";

  // Delete button. Deletes all slot inputs and the corresponding
  // event in the calendar
  var deleteButton = document.createElement('button');
  deleteButton.setAttribute('type', 'button');
  deleteButton.setAttribute('class', 'btn btn-danger');
  deleteButton.setAttribute('id', 'slotDelete' + slotId);
  deleteButton.textContent = 'Delete slot';
  deleteButton.addEventListener('click', function(event) {
    calenderEvent.remove();
    slot.parentNode.removeChild(slot);
    $('#addEventSlot').modal('hide');
  });

  // Div to hold location portion of form
  var locationDiv = document.createElement('div');
  locationDiv.setAttribute('class', 'form-group');
  locationDiv.appendChild(locationLabel);
  locationDiv.appendChild(location);

  // Div to hold max attendees portion of form
  var maxAttendeesDiv = locationDiv.cloneNode();
  maxAttendeesDiv.appendChild(maxAttendeesLabel);
  maxAttendeesDiv.appendChild(maxAttendees);

  // Append all the pieces together
  slot.appendChild(start);
  slot.appendChild(end);
  slot.appendChild(maxAttendeesDiv);
  slot.appendChild(locationDiv);
  slot.appendChild(deleteButton);

  // Hide form. Will become visible in the modal when user clicks
  // on correspondingevent in the calendar
  slot.hidden = true;

  // Append all new elements to the modal
  var modalBody = document.getElementById('modalBody');
  modalBody.appendChild(slot);
};
