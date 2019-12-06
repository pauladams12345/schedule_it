// Get all elements with a class of "date" or "time" and convert them to
// local time
window.addEventListener('load', function() {
 	var dates = document.getElementsByClassName('date');
	for (var i = 0; i < dates.length; i++) {
		dates[i].textContent = convertTextToDate(dates[i].textContent);
		dates[i].hidden = false;
	}

	var times = document.getElementsByClassName('time');
	for (var i = 0; i < times.length; i++) {
		times[i].textContent = convertTextToTime(times[i].textContent);
		times[i].hidden = false;
	}
});

// Given a date string in ISO 8601 format, make a JS date object to convert
// to local time and return a formatted string
function convertTextToDate(text) {
	var dateStringOptions = {weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric'};
	var date = new Date(text);
	return date.toLocaleDateString(undefined, dateStringOptions);
}

// Given a time string in ISO 8601 format, make a JS date object to convert
// to local time and return a formatted string
function convertTextToTime(text) {
	var timeStringOptions = {hour: '2-digit', minute: '2-digit', timeZoneName: 'short'};
	var time = new Date();
	time.setUTCHours(text.substring(0,2), text.substring(3,5), 0);
	return time.toLocaleTimeString(undefined, timeStringOptions);
}