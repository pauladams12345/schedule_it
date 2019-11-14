// TODO: figure out how to handle slot ID assignment on Manage Event
// Maybe pick a random starting value tied to the date/time? Want to
// avoid overlap.
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
      var slotId = slotNumber;
      slotNumber++;
      let hours = parseInt(document.getElementById('defaultDurationHours').value, 10);
      let minutes = parseInt(document.getElementById('defaultDurationMinutes').value, 10);
      let duration = (60 * hours) + minutes;
      info.end.setTime(info.start.getTime() + duration * 60000);
      // startT = info.startStr;
      // endT = info.endStr;
      /*var date = startT.substring(0, 10);
      var time = calendar.formatDate(startT, {hour : '2-digit', minute : '2-digit',
      second : '2-digit', hour12 : false});
      var slotTime = time + ' - ' + date;
      document.getElementById("start").value = startT;
      document.getElementById("end").value = endT;
      document.getElementById("timePeriod").textContent = slotTime;*/
      //console.log(startT);
      calendar.addEvent({id: slotId, start: info.start, end: info.end});
      appendSlot(info.start, info.end, slotId);
    },
    eventClick: function(clickInfo) {
      $('#addEventSlot').modal('show');
    },
    eventDrop: function(dropInfo) {
      let startInput = document.getElementById("slot" + dropInfo.event.id + "Start");
      let endInput = document.getElementById("slot" + dropInfo.event.id + "End");
      startInput.value = dropInfo.event.start;
      endInput.value = dropInfo.event.end;
    },
    eventResize: function(resizeInfo) {
      let endInput = document.getElementById("slot" + resizeInfo.event.id + "End");
      endInput.value = resizeInfo.event.end;
    }
  });
  calendar.render();
});

// Appends the slot input to the form
function appendSlot(startTime, endTime, slotNumber) {
    var startInput = document.createElement("input");
    startInput.setAttribute('type', 'text');
    startInput.setAttribute('name', 'slots');
    startInput.setAttribute('id', 'slot' + slotNumber + 'Start');
    startInput.value = startTime;

    var endInput = document.createElement("input");
    endInput.setAttribute('type', 'text');
    endInput.setAttribute('name', 'slots');
    endInput.setAttribute('id', 'slot' + slotNumber + 'End');
    endInput.value = endTime;

    // Location value is left empty unless user enters a location other than the
    // default. Will be replaced with defaultLocation if empty upon form submission.
    var locationInput = document.createElement("input");
    locationInput.setAttribute('type', 'text');
    locationInput.setAttribute('name', 'slots');
    locationInput.setAttribute('id', 'slot' + slotNumber + 'Location');

    document.getElementById('timeSlot').appendChild(startInput);
    document.getElementById('timeSlot').appendChild(endInput);
};
