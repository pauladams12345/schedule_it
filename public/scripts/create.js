// Client-side JS for the Create Event page

var numEmails = 0;
var slotIds = [];         // Store all id of every slot created
var slotStates = {};      // Track state of each slot. Options: new, notUsed
configureFormValidation();
configureCalendar();

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
        if (form.checkValidity() === true) {
          var data = $(this).serialize();
          data += "&" + $.param(slotStates);
          data += "&slotIds=" + encodeURIComponent(slotIds); 
          $.ajax({
            url : $(this).attr('action'),
            type: $(this).attr('method'),
            data: data,
            success: function(redirectURI) {
               window.location.replace(redirectURI); 
            },
            error: function (jXHR, textStatus, errorThrown) {
              alert(errorThrown);
            }
          });
        }
      }, false);
    });
  }, false);
}

// Create and manipulate the calendar
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
    configureSlotLocationDisplay(calendar);
    document.getElementById('addEmailsButton').addEventListener('click', splitEmails);
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

// Extract email addresses from textarea, create a separate email input
// for each, and do input validation
function splitEmails(event) {

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
    var newInput = createEmailInput(email, numEmails);   // create input
    var newDeleteButton = createDeleteButton();         // create delete button
    bindEmailDelete(newInput, newDeleteButton);              // bind delete button to input

    if ( newInput.checkValidity() ) {                   // do initial input validation
      newInput.classList.add('is-valid');
    } else {
      newInput.classList.add('is-invalid');
    }

    newInput.addEventListener('blur', validateEmail);   // do subsequent validation on blur

    appendInputAndButton(newInput, newDeleteButton);    // add to document

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
function createDeleteButton() {
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
function appendInputAndButton(input, button) {
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

// Binds the delete button in a slot's form. Deletes the input and the 
// corresponding event in the calendar.
function bindSlotDelete(deleteButton, calendarEvent, slot, slotId) {
    deleteButton.addEventListener('click', function(event) {
    calendarEvent.remove();
    slot.parentNode.removeChild(slot);
    slotStates["slotState" + slotId] = "notUsed";
    $('#addEventSlot').modal('hide');
  });
}

// Binds the save button in a slot's form. For slots with a status of existingUnmodified,
//changes the status to existingModified. Hides the modal
function bindSlotSave(saveButton, calendarEvent, slot, slotId) {
  saveButton.addEventListener('click', function(event) {
    let location = document.getElementById('slotLocation' + slotId).value;
    if (location != '') {
      calendarEvent.setProp('title', location);
    }
    slot.hidden = true;
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

  // Save button. Hides the slot's input in the modal
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
