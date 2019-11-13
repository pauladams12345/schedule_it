//Script to create and manipulate the calendar on the create event page
document.addEventListener('DOMContentLoaded', function() {
  dateFormat = {}
  let context = {};
  var startTime;
  var endTime;
  var eventLocation;
  var max_attendees;
  var calendarEl = document.getElementById('calendar');
  var modal = document.getElementById('exampleModal');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'bootstrap' ],
    themeSystem: 'bootstrap',
    defaultView: 'timeGridWeek',
    editable: true,
    selectable: true,
    eventLimit : true,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    eventTimeFormat: { // 7:30p.m.
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    select: function(info) {
      startT = info.startStr;
      endT = info.endStr;
      var date = startT.substring(0, 10);
      var time1 = calendar.formatDate(startT, {hour : '2-digit', minute : '2-digit',
      second : '2-digit', hour12 : false});
      //var time2 = calendar.formatDate(endT, {month:'long',year:'numeric',
      //day:'numeric', hour: '2-digit', minute : '2-digit', hour12 : true});
      var slotTime = time1 + ' - ' + date;
      document.getElementById("start").value = startT;
      document.getElementById("end").value = endT;
      document.getElementById("timePeriod").textContent = slotTime;
      //appendSlot(startT, date);
      //calendar.addEvent({title: eventLocation, start: startT, end: endT});
      calendar.addEvent({start: startT, end: endT});
      $('#addEventSlot').modal('show');
    }
  });
  //Used the following reference:
  //https://stackoverflow.com/questions/14207318/create-fullcalendar-calendar-event-on-submitting-the-form-in-bootstrap-modal-win
  $('#submitButton').on('click', function(event){
    event.preventDefault();
    createSlot();
  });
  function createSlot(){  //add slot to calendar for visibility
    $("#addEventSlot").modal('hide');
    eventLocation = document.getElementById("location").value;
    max_attendees = document.getElementById("max-attendees").value;
    calendar.addEvent({title: eventLocation, start: startT, end: endT});
  }
  calendar.render();
});

// Appends the slot input to the form
function appendSlot(date, startTime) {
    /*var row = document.createElement("div");
    row.setAttribute('class', 'row')
    var col = document.createElement("div");
    col.setAttribute('class', 'col-12 form-inline d-flex');
    var div = document.createElement("div");
    div.setAttribute('style', 'display: flex; flex-grow: 1;')

    div.appendChild(input)
    col.appendChild(div);
    col.appendChild(button);
    row.appendChild(col);*/
    document.getElementById('timeSlot').appendChild(input);
};
