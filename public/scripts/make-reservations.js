// Client-side JS for the Make a Reservation page

configureCalendar();

// Create and manipulate the calendar
function configureCalendar() {
  document.addEventListener('DOMContentLoaded', function() {
    // Create an array of all
    var userSlotIds = [];
    var userSlots = document.getElementsByClassName('userSlots');
    for (var i = 0; i < userSlots.length; i++) {
      userSlotIds.push(userSlots[i].getAttribute('id').substring(9));
    }

    dateFormat = {};
    var context = {};
    var startTime;
    var endTime;
    var numSelectedSlots = 0;  //holds current number of selected slots for this event before actual submission
    var slotCounter = 0;
    var max_resv_per_attendee = document.getElementById('max_resv_per_attendee').value;
    if (max_resv_per_attendee == 0) {
      max_resv_per_attendee = Number.MAX_SAFE_INTEGER;
    }
    var calendarEl = document.getElementById('calendar');
    var modal = document.getElementById('exampleModal');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'bootstrap' ],
      themeSystem: 'bootstrap',
      defaultView: 'timeGridWeek',
      slotDuration: '00:30',
      editable: false,
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
      // Upon clicking an existing slot, show the modal to edit details
      eventClick: function(clickInfo) {
        var slotId = clickInfo.event.id;  //retrives slot id #
        var startTime = clickInfo.event.start;
        var endTime = clickInfo.event.end;
        var location = document.getElementById('slotLocation' + slotId).value;
        var slotAttendee = document.getElementsByName('name' + slotId);
        var numUserResv = document.getElementById('numUserReservations').value;
        var numCurSelectedSlots = document.getElementsByName('resvSlotId').length;
        var maxAttendees = document.getElementById('maxAttendees' + slotId).value;
        if (maxAttendees == 0) {
          maxAttendees = Number.MAX_SAFE_INTEGER;
        }

        //logic for use cases: #resv per slot exceeded, #resv per event exceeded, or
        //limitations not exceeded.
        numResv = parseInt(numUserResv, 10);
        var totalResv = numCurSelectedSlots + numResv;

        if ($.inArray(slotId, userSlotIds) != -1) {
          // Do nothing
        }
        else if(totalResv >= max_resv_per_attendee){
          warningModalEvents();
        }
        else if(slotAttendee.length >= maxAttendees){
          warningModalSlots();
        }
        else{
          createModalBody(slotId);
          createSlotInputForm(slotId, startTime, endTime, location);
        }
      }
    });
    var existingSlots = document.getElementsByClassName('existingSlots');
    for (var i = 0; i < existingSlots.length; i++) {
      var slotId = existingSlots[i].getAttribute('id').substring(4);
      var startTime = new Date(document.getElementById('slotStart' + slotId).value);
      var endTime = new Date(document.getElementById('slotEnd' + slotId).value);
      var location = document.getElementById('slotLocation' + slotId).value;
      if ($.inArray(slotId, userSlotIds) != -1) {
        var calendarEvent = calendar.addEvent({id: slotId, start: startTime, end: endTime, title: "Registered", backgroundColor: '#D3832B'});
      }
      else {
        var calendarEvent = calendar.addEvent({id: slotId, start: startTime, end: endTime, title: location});
      }
    }
    calendar.render();
  });
}

// Creates inputs for start time, end time, location, and maxAttendees
// for a new slot and appends to the modal. Hidden by default.
function createModalBody(slotId) {

  //check if modal body already exists if so remove in order to create a new modal body.
  //this allows the software to start with an empty modal, removing all the previous data.
  let element = document.getElementById("modalBodyDiv");
  if(element){
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    element.parentNode.removeChild(element);
  }

  var slot = document.createElement('div');
  var modalParagraph = document.createElement('p');
  slot.setAttribute('id', 'modalBodyDiv');

  var visibility = document.getElementById('visibility').value;
  if (visibility == 0) {
    var text = document.createTextNode('Sorry, attendee information for this event is private');
    modalParagraph.appendChild(text);
    slot.appendChild(modalParagraph);
  }
  else {
    var name = document.getElementsByName('name' + slotId);
    if (name.length == 0) {
      var text = document.createTextNode('There are currently no other reservations.');
      modalParagraph.appendChild(text);
      slot.appendChild(modalParagraph);
    }
    else {
      for (var i = 0; i < name.length; i++){
        var br = document.createElement('br');
        var attendeeName = document.createTextNode(name[i].value);
        modalParagraph.appendChild(attendeeName);
        modalParagraph.appendChild(br);
      }
      slot.appendChild(modalParagraph);
    }
  }

  // Append all new elements to the modal
  var modalBody = document.getElementById('modalBody');
  modalBody.appendChild(slot);
  $('#resvSlot').modal('show');
}

// Show the warning modal for a full slot
function warningModalSlots(){
  $('#resvSlotExceeded').modal('show');
}

// show the warning modal for when a user has reserved their max number of slots
function warningModalEvents(){
  $('#resvEventExceeded').modal('show');
}

// Create a row in the "Selected time slots" table for the selected slot
// and also create a hidden input with the slot details
function createSlotInputForm(slotId, slotStartTime, slotEndTime, slotLocation){

  //create table rows
  let userSlotExist = document.getElementById('userSlot' + slotId);
  let rowExist = document.getElementById('row' + slotId);
  if(userSlotExist === null && rowExist === null){
    var body = document.getElementById('body');
    var row = document.createElement('tr');
    row.setAttribute('id','row' + slotId);
    var startTime = document.createElement('td');
    var endTime = document.createElement('td');
    var cellLocation = document.createElement('td');
    var slot_Id = document.createElement('td');
    var deleteButton = document.createElement('td');
    var button = document.createElement('button');
    button.setAttribute('class','btn btn-primary reservation-delete');
    button.textContent = 'Remove';
    var dateStringOptions = {weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric'};
    var timeStringOptions = {hour: '2-digit', minute: '2-digit', timeZoneName: 'short'};
    startTime.textContent = slotStartTime.toLocaleDateString(undefined, dateStringOptions) +
    ' ' + slotStartTime.toLocaleTimeString(undefined, timeStringOptions);
    endTime.textContent = slotEndTime.toLocaleTimeString(undefined, timeStringOptions);
    cellLocation.textContent = slotLocation;
    slot_Id.textContent = slotId;
    slot_Id.hidden = true;
    deleteButton.appendChild(button);
    row.appendChild(slot_Id);
    row.appendChild(startTime);
    row.appendChild(endTime);
    row.appendChild(cellLocation);
    row.appendChild(deleteButton);
    body.appendChild(row);
    bindReservationDelete(button, slotId);

    //create inputs for form
    var id = document.createElement('input');
    id.setAttribute('type', 'text');
    id.setAttribute('name', 'resvSlotId');
    id.setAttribute('id', 'resvSlotId' + slotId);
    id.value = slotId;
    id.hidden = true;

    var slotsDivison = document.getElementById('slots');
    slotsDivison.appendChild(id);
  }
}

// Bind the delete button for a reservation in the "Seleted time slots" table
function bindReservationDelete(button, slotId) {
  button.addEventListener('click', function(event) {
    var row = document.getElementById('row' + slotId);
    row.parentNode.removeChild(row);  //remove reservation from table
    var input = document.getElementById('resvSlotId' + slotId);
    input.parentNode.removeChild(input);  //remove reservation from form inputs
  });
}
