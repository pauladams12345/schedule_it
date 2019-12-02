configureCalendar();

//Script to create and manipulate the calendar on the reservations page
function configureCalendar() {
  document.addEventListener('DOMContentLoaded', function() {
    dateFormat = {}
    var context = {};
    var startTime;
    var endTime;
    var numSelectedSlots = 0;  //holds current number of selected slots for this event before actual submission
    var slotCounter = 0;
    var max_attendee_per_slot = document.getElementById('max_attendee_per_slot').value;
    var max_resv_per_attendee = document.getElementById('max_resv_per_attendee').value;
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
        var slotAttendee = document.getElementsByName('name' + slotId);
        var numUserResv = document.getElementById('numOfUserResv4Event').value;
        var numCurSelectedSlots = document.getElementsByName('resvSlotId').length;
        console.log(max_attendee_per_slot);
        console.log(slotAttendee.length);
        console.log(numCurSelectedSlots);
        console.log(numUserResv);
        console.log(max_resv_per_attendee);
        //logic for use cases: #resv per slot exceeded, #resv per event exceeded, or
        //limitations not exceeded.
        var totalResv = numCurSelectedSlots + numUserResv;
        console.log(totalResv);
        if(totalResv >= max_resv_per_attendee){
          console.log("test");
          warningModalEvents();
        }
        else if(slotAttendee.length >= max_attendee_per_slot){
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
      var calendarEvent = calendar.addEvent({id: slotId, start: startTime, end: endTime, title: location});
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

  var name = document.getElementsByName('name' + slotId);
  for (var i = 0; i < name.length; i++){
    var br = document.createElement('br');
    var attendeeName = document.createTextNode(name[i].value);
    modalParagraph.appendChild(attendeeName);
    modalParagraph.appendChild(br);
    slot.appendChild(modalParagraph);
  }

  // Append all new elements to the modal
  var modalBody = document.getElementById('modalBody');
  modalBody.appendChild(slot);
  $('#resvSlot').modal('show');
};

function warningModalSlots(){
  $('#resvSlotExceeded').modal('show');
};

function warningModalEvents(){
  $('#resvEventExceeded').modal('show');
};

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
    button.textContent = 'Delete';
    startTime.textContent = slotStartTime;
    endTime.textContent = slotEndTime;
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

function bindReservationDelete(button, slotId) {
  button.addEventListener('click', function(event) {
    var row = document.getElementById('row' + slotId);
    row.parentNode.removeChild(row);  //remove reservation from table
    var input = document.getElementById('resvSlotId' + slotId);
    input.parentNode.removeChild(input);  //remove reservation from form inputs
  })
}
