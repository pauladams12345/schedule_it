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
      // Upon clicking an existing slot, show the modal to edit details
      eventClick: function(clickInfo) {
        var slotId = clickInfo.event.id;  //retrives slot id #
        var startTime = document.getElementById('slotStart' + slotId).value.substring(0,21);
        var endTime = document.getElementById('slotEnd' + slotId).value.substring(0,21);
        var location = document.getElementById('slotLocation' + slotId).value;
        createModalBody(slotId);
        createSlotInputForm(slotId, startTime, endTime, location);
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

function createSlotInputForm(slotId, start, end, location){

  var slotTime = document.getElementById('slotStart' + slotId).value;
  var time = document.createElement('p');
  var slotTimePeriod = start + '-' + end + '     ' + location;
  var slotTimePeriodNode = document.createTextNode(slotTimePeriod);
  time.appendChild(slotTimePeriodNode);
  time.setAttribute('type', 'text');
  time.setAttribute("style", "background-color: white;");
  time.setAttribute('name', 'resvTime' + slotId);
  time.setAttribute('id', 'resvTime' + slotId);
  time.hidden = false;

  var startTime = document.getElementById('slotStart' + slotId).value;
  var start = document.createElement('input');
  start.setAttribute('type', 'text');
  start.setAttribute('name', 'resvSlotStart' + slotId);
  start.setAttribute('id', 'resvSlotStart' + slotId);
  start.value = s;
  start.hidden = false;

  var endTime = document.getElementsByName('slotEnd' + slotId).value;
  var end = document.createElement('input');
  end.setAttribute('type', 'text');
  end.setAttribute('name', 'resvSlotEnd' + slotId);
  end.setAttribute('id', 'resvSlotEnd' + slotId);
  end.value = e;
  end.hidden = false;

  var location = document.getElementsByName('slotLocation' + slotId).value;
  var loc = document.createElement('input');
  loc.setAttribute('type', 'text');
  loc.setAttribute('name', 'resvSlotLocation' + slotId);
  loc.setAttribute('id', 'resvSlotLocation' + slotId);
  loc.value = l;
  loc.hidden = false;

  var id = document.createElement('input');
  id.setAttribute('type', 'text');
  id.setAttribute('name', 'resvSlotId' + slotId);
  id.setAttribute('id', 'resvSlotId' + slotId);
  id.value = slotId;
  id.hidden = false;

  var slotsDivison = document.getElementById('slots');
  slotsDivison.appendChild(time);
  //slotsDivison.appendChild(end);
  //slotsDivison.appendChild(loc);
  //slotsDivison.appendChild(id);
}
