var numEmails = 0;        // Used to create unique id for email inputs as they're dynamically created
var slotIds = [];         // Store all id of every slot created
var slotStates = {};      // Track state of each slot. Options: new, notUsed, existingUnmodified, existingModified, existingDeleted
configureCalendar();
//configureFormSubmissions();
//configureReservations();
//configureFormValidation();

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
        var defaultLocation = document.getElementById('defaultLocation').value;
        var calendarEvent = calendar.addEvent({id: slotId, start: info.start, end: info.end, title: defaultLocation});
        appendSlot(info.start, info.end, slotId, calendarEvent);
        slotStates["slotState" + slotId] = 'new';
        slotIds.push(slotId);
      },
      // Upon clicking an existing slot, show the modal to edit details
      eventClick: function(clickInfo) {
        var slotId = clickInfo.event.id;  //retrives slot id #
        createModalBody(slotId);
        console.log("test");
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
    var existingSlots = document.getElementsByClassName('existingSlots');
    for (var i = 0; i < existingSlots.length; i++) {
      var slotId = existingSlots[i].getAttribute('id').substring(4);
      var startTime = new Date(document.getElementById('slotStart' + slotId).value);
      var endTime = new Date(document.getElementById('slotEnd' + slotId).value);
      var location = document.getElementById('slotLocation' + slotId).value;
      var calendarEvent = calendar.addEvent({id: slotId, start: startTime, end: endTime, title: location});
    }
    calendar.render();
  });
}

// Creates inputs for start time, end time, location, and maxAttendees
// for a new slot and appends to the modal. Hidden by default.
function createModalBody(slotId) {

  var modalDiv = document.getElementById('modalBodyDiv');
  if (modalDiv !== null){
    //let element = document.getElementById("top");
    while (modalDiv.firstChild) {
      modalDiv.removeChild(element.firstChild);
    }
  }

  var slot = document.createElement('div');
  slot.setAttribute('id', 'modalBodyDiv');

  var name = document.getElementsByName('name' + slotId);
  console.log(name);
  for (var i = 0; i < name.length; i++){
    var modalParagraph = document.createElement('p');
    var attendeeName = document.createTextNode(name[i].value);
    modalParagraph.appendChild(attendeeName);
    slot.appendChild(modalParagraph);
  }

  // Append all new elements to the modal
  var modalBody = document.getElementById('modalBody');
  modalBody.appendChild(slot);
  $('#resvSlot').modal('show');
};
