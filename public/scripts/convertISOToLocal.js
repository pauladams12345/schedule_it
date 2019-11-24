var dates = document.getElementsByClassName('date');
var dateStringOptions = {weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric'};
for (var i = 0; i < dates.length; i++) {
	let date = new Date(dates[i].textContent);
	console.log('textcontent: ', dates[i].textContent);
	console.log('date:', date);
	dates[i].textContent = date.toLocaleDateString(undefined, dateStringOptions);
	dates[i].hidden = false;
}

var times = document.getElementsByClassName('time');
var timeStringOptions = {hour: '2-digit', minute: '2-digit', timeZoneName: 'short'};
for (var i = 0; i < times.length; i++) {
	let time = new Date();
	time.setUTCHours(times[i].textContent.substring(0,2), times[i].textContent.substring(3,5), 0);
	console.log('time: ', time);
	times[i].textContent = time.toLocaleTimeString(undefined, timeStringOptions);
	times[i].hidden = false;
}

