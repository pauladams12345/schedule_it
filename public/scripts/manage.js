// Client-side JS for the Manage Event page

var numEmails = 0;        // Used to create unique id for email inputs as they're dynamically created
var slotIds = [];         // Store all id of every slot created
var slotStates = {};      // Track state of each slot. Options: new, notUsed, existingUnmodified, existingModified, existingDeleted
configureCalendar();
configureFormSubmissions();
configureReservations();
configureFormValidation();
configureManualRegistration();

//Script to create and manipulate the calendar on the create event page
function configureCalendar() {
  document.addEventListener('DOMContentLoaded', function() {
    dateFormat = {};
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
      eventColor: '#000000',
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
        var defaultLocation = document.getElementById('defaultLocation').value;
        var calendarEvent = calendar.addEvent({id: slotId, start: info.start, end: info.end, title: defaultLocation});
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
      var location = document.getElementById('slotLocation' + slotId).value;
      var calendarEvent = calendar.addEvent({id: slotId, start: startTime, end: endTime, title: location});
      slotStates['slotState' + slotId] = 'existingUnmodified';
      slotIds.push(slotId);
      var deleteButton = document.getElementById('slotDelete' + slotId);
      bindSlotDelete(deleteButton, calendarEvent, existingSlots[i], slotId);
      var saveButton = document.getElementById('slotSave' + slotId);
      bindSlotSave(saveButton, calendarEvent, existingSlots[i], slotId);
    }
    document.getElementById('addEmailsButton').addEventListener('click', splitEmails);
    configureSlotLocationDisplay(calendar);

    calendar.render();
  });
}

// When focus blurs from the default location input, update the title of all events
// that don't have a custom location (set in modal)
function configureSlotLocationDisplay(calendar) {
  var defaultLocationInput = document.getElementById('defaultLocation');
  defaultLocationInput.addEventListener('blur', function (e){
    var events = calendar.getEvents();
    for (var i = 0; i < events.length; i++) {
      if (document.getElementById('slotLocation' + events[i].id).value == '') {
        events[i].setProp('title', defaultLocationInput.value);
      }
    }
  });
}

// Configure form submissions to stay on current page and send
// form details via ajax
function configureFormSubmissions() {
   document.addEventListener('DOMContentLoaded', function() {

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
    $('#invitationsForm').on('submit', function(e) {
      e.preventDefault();
      $.ajax({
        url : $(this).attr('action'),
        type: $(this).attr('method'),
        data: $(this).serialize(),
        success: function(data) {
          window.location.reload();
        },
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
            if(!alert(data)){
              window.location.reload();
            }
          }

        },
        error: function (jXHR, textStatus, errorThrown) {
          alert(errorThrown);
        }
      });
    });

    // Submit visibility form with ajax to prevent page refresh
    $('#manualReservationForm').on('submit', function(e) {
      e.preventDefault();
      $.ajax({
        url : $(this).attr('action'),
        type: $(this).attr('method'),
        data: $(this).serialize(),
        success: function(data) {
          window.location.reload();
        },
        error: function (jXHR, textStatus, errorThrown) {
          alert(errorThrown);
        }
      });
    });
  });
}



// For every reservation, bind the delete button
function configureReservations() {
  document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.getElementsByClassName('reservation-delete');
    for (var i = 0; i < buttons.length; i++) {
      var reservation = buttons[i].parentNode.parentNode;
      var onid = reservation.firstElementChild.textContent;
      var slotId = reservation.firstElementChild.nextElementSibling.textContent;
      bindReservationDelete(buttons[i], reservation, onid, slotId);
    }
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
  location.setAttribute('class', 'form-control');
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
  bindSlotDelete(deleteButton, calendarEvent, slot, slotId);

  // Save button. Hides the slot's form in the modal
  var saveButton = document.createElement('button');
  saveButton.setAttribute('type', 'button');
  saveButton.setAttribute('class', 'btn btn-success');
  saveButton.setAttribute('id', 'slotSave' + slotId);
  saveButton.setAttribute('data-dismiss', 'modal');
  saveButton.textContent = 'Save changes';
  bindSlotSave(saveButton, calendarEvent, slot, slotId);

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
}

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
}

// Populate the "Manually make a reservation" form with the info for every
// registered user and every slot
function configureManualRegistration() {
  window.addEventListener('load', function() {
    var existingSlots = document.getElementsByClassName('existingSlot');
    options = [];
    for (var i = 0; i < existingSlots.length; i++) {
      var slotId = existingSlots[i].getAttribute('id').substring(4);
      var startTime = new Date(document.getElementById('slotStart' + slotId).value);
      var endTime = new Date(document.getElementById('slotEnd' + slotId).value);
      var location = document.getElementById('slotLocation' + slotId).value;
      var dateStringOptions = {weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric'};
      var timeStringOptions = {hour: '2-digit', minute: '2-digit', timeZoneName: 'short'};
      options.push(
         $('<option />')
        .text(startTime.toLocaleDateString(undefined, dateStringOptions) + " " +
          startTime.toLocaleTimeString(undefined, timeStringOptions) + ' - ' + 
          endTime.toLocaleTimeString(undefined, timeStringOptions) + ' ' + 
          location)
        .val(slotId)
      );
    }
    $('#manualReservationSlotId').append(options);
  });
}

// Bind the delete button for an entry in the "Reservations" table
function bindReservationDelete(button, reservation, onid, slotId) {
  button.addEventListener('click', function(event) {
    // Send ajax request to delete reservation
    $.ajax({
      url : '/manage/delete-reservation',
      type: 'POST',
      data: $.param({"onid": onid, "slotId": slotId}),
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
    reservation.parentNode.removeChild(reservation);
  });
}

// Bind the delete button for the entire event
function bindEventDelete(button, eventId) {
  button.addEventListener('click', function(event) {
    // Send ajax request to delete event
    $.ajax({
      url : '/manage/delete-event',
      type: 'POST',
      data: $.param({"eventId": eventId}),
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
      }
    });
  });
}

// Bind the delete button in a slot's form (shows in modal). Deletes the form and the corresponding
// event in FullCalendar. Changes existing slot's status to existingDeleted and new slots
// status to notUsed
function bindSlotDelete(button, calendarEvent, slot, slotId) {
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
}

// Bind the save button in a slot's form. For slots with a status of existingUnmodified,
//changes the status to existingModified. Hides the modal
function bindSlotSave(saveButton, calendarEvent, slot, slotId) {
  saveButton.addEventListener('click', function(event) {
    if (slotStates['slotState' + slotId] == "existingUnmodified") {
      slotStates['slotState' + slotId] = 'existingModified';
    }
    let location = document.getElementById('slotLocation' + slotId).value;
    if (location != '') {
      calendarEvent.setProp('title', location);
    }

    slot.hidden = true;
  });
}

// Extract email addresses from textarea, create a separate email input
// for each, and do input validation
function splitEmails(event) {
  // Show hidden "Send invitations" button
  document.getElementById('sendInvitations').hidden = false;

  // Get emails from textarea
  var allEmails = document.getElementById('emailAddresses').value;  // extract emails
  if ( allEmails.length == 0 ) {
    return;
  }
  var splitEmails = allEmails.split(/\s*,\s*|\s+/);     // split emails into separate strings
  document.getElementById('emailAddresses').value = ''; // delete text from textarea

  // Create an email input and delete button for each email address
  for (var email of splitEmails) {

    if (email == "") {
      continue;
    }

    numEmails++;
    var newInput = createEmailInput(email, numEmails);  // create input
    var newDeleteButton = createEmailDelete();         // create delete button
    bindEmailDelete(newInput, newDeleteButton);              // bind delete button to input

    if ( newInput.checkValidity() ) {                   // do initial input validation
      newInput.classList.add('is-valid');
    } else {
      newInput.classList.add('is-invalid');
    }

    newInput.addEventListener('blur', validateEmail);   // do subsequent validation on blur

    appendEmailInputAndButton(newInput, newDeleteButton);    // add to document

  }
}

// Return an email input with value matching the 1st argument
function createEmailInput(email, inputNumber) {
  var input = document.createElement("input");

  input.setAttribute('type', 'email');
  input.setAttribute('class', 'form-control w-100');
  input.setAttribute('name', 'emails');
  input.setAttribute('id', 'email' + inputNumber);

  input.value = email;

  return input;
}

// Returns a button for deleting an email input
function createEmailDelete() {
  var button = document.createElement("button");

  button.setAttribute('type', 'button');
  button.setAttribute('class', 'btn btn-sm btn-danger mx-2');
  button.setAttribute('id', 'emailDelete' + numEmails);
  button.textContent = 'Delete';

  return button;
}

// Checks if an email input's value is valid and sets formatting appropriately
function validateEmail(event) {
    // Add dynamic input validation
  if ( this.checkValidity() ) {
    this.classList.remove('is-invalid');
    this.classList.add('is-valid');
  }
  else {
    this.classList.add('is-valid');
    this.classList.add('is-invalid');
  }
}

// Appends the given email input and button to the document
function appendEmailInputAndButton(input, button) {
    // Append row and column for new input and append to document
    var row = document.createElement("div");
    row.setAttribute('class', 'row');
    var col = document.createElement("div");
    col.setAttribute('class', 'col-12 form-inline d-flex');
    var div = document.createElement("div");
    div.setAttribute('style', 'display: flex; flex-grow: 1;');

    div.appendChild(input);
    col.appendChild(div);
    col.appendChild(button);
    row.appendChild(col);
    document.getElementById('emailsDiv').appendChild(row);
}

// Sets the supplied button to delete the corresponding
// input (and itself) upon being clicked
function bindEmailDelete(input, button) {
  button.addEventListener('click', function(event) {
    input.remove();
    button.remove();
  });
}
