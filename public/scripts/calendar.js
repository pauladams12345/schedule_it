//Script to create and manipulate calendar on the create event page
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
      var time1 = calendar.formatDate(startT, {month:'long',year:'numeric',
      day:'numeric', hour: '2-digit', minute : '2-digit', hour12 : true});
      var time2 = calendar.formatDate(endT, {month:'long',year:'numeric',
      day:'numeric', hour: '2-digit', minute : '2-digit', hour12 : true});
      var slotTime = time1 + ' - ' + time2;
      document.getElementById("start").value = startT;
      document.getElementById("end").value = endT;
      document.getElementById("timePeriod").textContent = slotTime;
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
