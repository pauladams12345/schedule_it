let mailgun = require("mailgun-js"),
	DOMAIN = "sandbox0e8f8a6368da4e8ab06448f9de870507.mailgun.org",
	mg = mailgun({apiKey: "fda0cf14403f53806e01b759277a8a66-f7910792-bc0058e7", domain: DOMAIN});

module.exports.sendTestEmail = function(organizerName, eventName, eventDescription, eventId, emails) {

	let from = "Indaba Scheduler <postmaster@sandbox0e8f8a6368da4e8ab06448f9de870507.mailgun.org>";
	let recipientVariables = {}
	for (let email of emails) {
		recipientVariables[email] = {};
	}
	let subject = "Invitation to " + eventName;
	
	let text = "Hello,\n\n" + 
	organizerName + " has inivted you to " +
	eventName + "!\n\n";
	if (eventDescription) {
		text += "Description: " + eventDescription + "\n\n";
	}
	text += "Click below to check out the event details and make your reservation\n\n" +
	"https://indaba-scheduler.herokuapp.com/make-reservations/" + eventId;

	const data = {
		"from": from,
		"to": emails,
		"recipient-variables": recipientVariables,
		"subject": subject,
		"text": text
	};

	console.log("data: ", data);

	mg.messages().send(data, function (error, body) {
		console.log(body);
	});	
}
