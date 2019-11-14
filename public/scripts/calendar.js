//Script to create and manipulate the calendar on the create event page
document.addEventListener('DOMContentLoaded', function() {
  dateFormat = {}
  let context = {};
  var startTime;
  var endTime;
  var slotNumber = 0;
  var max_attendees;
  var calendarEl = document.getElementById('calendar');
  var modal = document.getElementById('exampleModal');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: [ 'interaction', 'dayGrid', 'timeGrid', 'bootstrap' ],
    themeSystem: 'bootstrap',
    defaultView: 'timeGridWeek',
    slotDuration: '00:15',
    //slotLabelInterval: '01:00:00',
    editable: true,
    selectable: true,
    eventLimit : true,
    longPressDelay: 0,
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
    select: function(info) {
      let hours = parseInt(document.getElementById('defaultDurationHours').value, 10);
      let minutes = parseInt(document.getElementById('defaultDurationMinutes').value, 10);
      let duration = (60 * hours) + minutes;
      info.end = new Date(info.start.getTime() + duration * 60000);
      console.log("start: ", info.start);
      console.log("end: ", info.end);
      startT = info.startStr;
      endT = info.endStr;
      slotNumber++;
      /*var date = startT.substring(0, 10);
      var time = calendar.formatDate(startT, {hour : '2-digit', minute : '2-digit',
      second : '2-digit', hour12 : false});
      var slotTime = time + ' - ' + date;
      document.getElementById("start").value = startT;
      document.getElementById("end").value = endT;
      document.getElementById("timePeriod").textContent = slotTime;*/
      //console.log(startT);
      calendar.addEvent({start: info.start, end: info.end});
      appendSlot(startT,slotNumber);
    }
  });
  calendar.render();
});

// Appends the slot input to the form
function appendSlot(startT, slotNumber) {
    var input = document.createElement("input");
    input.setAttribute('type', 'text');
    input.setAttribute('class', 'form-control w-100');
    input.setAttribute('name', 'slots');
    input.setAttribute('id', 'slot' + slotNumber);
    input.value = startT;
    document.getElementById('timeSlot').appendChild(input);
};
