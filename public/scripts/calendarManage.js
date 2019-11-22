var numEmails = 0;
var slotIds = [];         // Store all id of every slot created
var slotStates = {};      // Track state of each slot. Options: new, notUsed, existingUnmodified, existingModified, existingDeleted
configureFormValidation();
configureCalendar();

//Script to create and manipulate the calendar on the create event page
function configureCalendar() {
  document.addEventListener('DOMContentLoaded', function() {
    dateFormat = {}
    var context = {};
    var startTime;
    var endTime;
    var slotCounter = 0;
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
      longPressDelay: 20,
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
        var slotId = slotCounter;
        slotCounter++;
        var hours = parseInt(document.getElementById('defaultDurationHours').value, 10);
        var minutes = parseInt(document.getElementById('defaultDurationMinutes').value, 10);
        var duration = (60 * hours) + minutes;
        info.end.setTime(info.start.getTime() + duration * 60000);
        var calendarEvent = calendar.addEvent({id: slotId, start: info.start, end: info.end});
        appendSlot(info.start, info.end, slotId, calendarEvent);
        slotStates["slotState" + slotId] = 'new';
        slotIds.push(slotId);
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
        $('#addEventSlot').modal('show');
      },
      // Upon dragging and dropping an event, update the start and end times
      eventDrop: function(dropInfo) {
        var slotId = dropInfo.event.id;
        var startInput = document.getElementById("slotStart" + dropInfo.event.id);
        var endInput = document.getElementById("slotEnd" + dropInfo.event.id);
        startInput.value = dropInfo.event.start;
        endInput.value = dropInfo.event.end;
        if (slotStates['slotState' + slotId] == "existingUnmodified") {
         slotStates['slotState' + slotId] = 'existingModified';
        }
      },
      // Upon resizing an event, update the end time
      eventResize: function(resizeInfo) {
        var slotId = resizeInfo.event.id;
        var endInput = document.getElementById("slotEnd" + resizeInfo.event.id);
        endInput.value = resizeInfo.event.end;
        if (slotStates['slotState' + slotId] == "existingUnmodified") {
         slotStates['slotState' + slotId] = 'existingModified';
        }
      }
    });
    // for every existing slot input, create an event and register its delete button
    var existingSlots = document.getElementsByClassName('existingSlot');
    for (var i = 0; i < existingSlots.length; i++) {
      var slotId = existingSlots[i].getAttribute('id').substring(4);
      var startTime = new Date(document.getElementById('slotStart' + slotId).value);
      var endTime = new Date(document.getElementById('slotEnd' + slotId).value);
      var calendarEvent = calendar.addEvent({id: slotId, start: startTime, end: endTime});
      slotStates['slotState' + slotId] = 'existingUnmodified';
      slotIds.push(slotId);
      var deleteButton = document.getElementById('slotDelete' + slotId);
      bindDelete(deleteButton, calendarEvent, existingSlots[i], slotId)
      var saveButton = document.getElementById('slotSave' + slotId);
      bindSave(saveButton, slotId, existingSlots[i]);
    }
    configureFormSubmissions();

    calendar.render();
  });
}

// Creates inputs for start time, end time, location, and maxAttendees
// for a new slot and appends to the modal. Hidden by default.
function appendSlot(startTime, endTime, slotId, calendarEvent) {
  var slot = document.createElement('div');
  slot.setAttribute('id', 'slot' + slotId);

  // Event start time (remains hidden)
  var start = document.createElement('input');
  start.setAttribute('type', 'text');
  start.setAttribute('name', 'slotStart' + slotId);
  start.setAttribute('id', 'slotStart' + slotId);
  start.value = startTime;
  start.hidden = true;

  // Event end time (remains hidden)
  var end = document.createElement('input');
  end.setAttribute('type', 'text');
  end.setAttribute('name', 'slotEnd' + slotId);
  end.setAttribute('id', 'slotEnd' + slotId);
  end.value = endTime;
  end.hidden = true;

  // Slot location. Defaults to null. Will be replaced with defaultLocation
  // upon form submission if not explicitly specified.
  var location = document.createElement('input');
  location.setAttribute('type', 'text');
  location.setAttribute('class', 'form-control')
  location.setAttribute('name', 'slotLocation' + slotId);
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
  maxAttendees.setAttribute('name', 'slotMaxAttendees' + slotId);
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
  bindDelete(deleteButton, calendarEvent, slot, slotId)

  // Save button. Hides the slot's form in the modal
  var saveButton = document.createElement('button');
  saveButton.setAttribute('type', 'button');
  saveButton.setAttribute('class', 'btn btn-success');
  saveButton.setAttribute('id', 'slotSave' + slotId);
  saveButton.setAttribute('data-dismiss', 'modal');
  saveButton.textContent = 'Save changes';
  bindSave(saveButton, slotId, slot);

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
  slot.appendChild(saveButton);

  // Hide form. Will become visible in the modal when user clicks
  // on corresponding event in the calendar
  slot.hidden = true;

  // Append all new elements to the modal
  var modalBody = document.getElementById('modalBody');
  modalBody.appendChild(slot);
};

// Disable form submissions if there are invalid fields
// Adapted from https://getbootstrap.com/docs/4.0/components/forms/
function configureFormValidation() {
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
          event.preventDefault();
          event.stopPropagation();
          form.classList.add('was-validated');
      }, false);
    });
  }, false);
};

// Bind the delete button in a slot's form. Deletes the form and the corresponding 
// event in FullCalendar. Changes existing slot's status to existingDeleted and new slots
// status to notUsed
function bindDelete(button, calendarEvent, slot, slotId) {
  button.addEventListener('click', function(event) {
    if (slotStates['slotState' + slotId] == "new") {
      slotStates['slotState' + slotId] = 'notUsed';
    }
    else {
      slotStates['slotState' + slotId] = 'existingDeleted';
    }
    calendarEvent.remove();
    slot.parentNode.removeChild(slot);
    $('#addEventSlot').modal('hide');
  });
};

// Bind the save button in a slot's form. For slots with a status of existingUnmodified,
//changes the status to existingModified. Hides the modal
function bindSave(saveButton, slotId, slot) {
  saveButton.addEventListener('click', function(event) {
    if (slotStates['slotState' + slotId] == "existingUnmodified") {
      slotStates['slotState' + slotId] = 'existingModified';
    }
    slot.hidden = true;
  });
};

// Configure form submissions to stay on current page and send
// form details via ajax
function configureFormSubmissions() {
  // Submit name form with ajax to prevent page refresh
  $('#editNameForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url : $(this).attr('action'),
      type: $(this).attr('method'),
      data: $(this).serialize(),
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });

  // Submit description form with ajax to prevent page refresh
  $('#editDescriptionForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url : $(this).attr('action'),
      type: $(this).attr('method'),
      data: $(this).serialize(),
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });

  // Submit max reservations form with ajax to prevent page refresh
  $('#editMaxReservationsPerAttendeeForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url : $(this).attr('action'),
      type: $(this).attr('method'),
      data: $(this).serialize(),
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });

  // Submit visibility form with ajax to prevent page refresh
  $('#attendeeNameVisibilityForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url : $(this).attr('action'),
      type: $(this).attr('method'),
      data: $(this).serialize(),
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });

  // Submit visibility form with ajax to prevent page refresh
  $('#editSlotsForm').on('submit', function(e) {
    var data = $(this).serialize();
    data += "&" + $.param(slotStates);
    data += "&slotIds=" + encodeURIComponent(slotIds);
    console.log(data);  
    $.ajax({
      url : $(this).attr('action'),
      type: $(this).attr('method'),
      data: data,
      success: function(data) {
        // If changes could not be applied, display error and reload page
        if (data.substring(0,5) == 'Error') {
          if(!alert(data)) {
            window.location.reload();
          }
        }
        // Else changes were successful, alert user
        else {
          alert(data)
        }

      },
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });
};


