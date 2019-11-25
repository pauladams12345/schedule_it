configureCalendar();

//Script to create and manipulate the calendar on the reservations page
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
        createSlotInputForm(slotId);
      },
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

  //check if modal body already exists if so remove in order to create a new modal body.
  let element = document.getElementById("modalBodyDiv");
  if(element){
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    element.parentNode.removeChild(element);
  }

  var slot = document.createElement('div');
  slot.setAttribute('id', 'modalBodyDiv');

  var name = document.getElementsByName('name' + slotId);
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

function createSlotInputForm(slotId){
  console.log(document.getElementById('slotStart' + slotId).value);
  var startTime = document.getElementById('slotStart' + slotId).value;
  var start = document.createElement('input');
  start.setAttribute('type', 'text');
  start.setAttribute('name', 'resvSlotStart' + slotId);
  start.setAttribute('id', 'resvSlotStart' + slotId);
  start.value = endTime;
  start.hidden = false;

  var endTime = document.getElementsByName('slotEnd' + slotId).value;
  var end = document.createElement('input');
  end.setAttribute('type', 'text');
  end.setAttribute('name', 'resvSlotEnd' + slotId);
  end.setAttribute('id', 'resvSlotEnd' + slotId);
  end.value = endTime;
  end.hidden = false;

  var location = document.getElementsByName('slotLocation' + slotId).value;
  var loc = document.createElement('input');
  loc.setAttribute('type', 'text');
  loc.setAttribute('name', 'resvSlotLocation' + slotId);
  loc.setAttribute('id', 'resvSlotLocation' + slotId);
  loc.value = location;
  loc.hidden = false;

  var id = document.createElement('input');
  id.setAttribute('type', 'text');
  id.setAttribute('name', 'resvSlotLocation' + slotId);
  id.setAttribute('id', 'resvSlotLocation' + slotId);
  id.value = slotId;
  id.hidden = false;

  var slotsDivison = document.getElementById('slots');
  slotsDivison.appendChild(start);
  slotsDivison.appendChild(end);
  slotsDivison.appendChild(loc);
  slotsDivison.appendChild(id);
}
