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

function convertTextToDate(text) {
	var dateStringOptions = {weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric'};
	var date = new Date(text);
	return date.toLocaleDateString(undefined, dateStringOptions);
};

function convertTextToTime(text) {
	var timeStringOptions = {hour: '2-digit', minute: '2-digit', timeZoneName: 'short'};
	var time = new Date();
	time.setUTCHours(text.substring(0,2), text.substring(3,5), 0);
	return time.toLocaleTimeString(undefined, timeStringOptions);
};