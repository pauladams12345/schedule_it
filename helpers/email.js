// Code for sending invitation emails using mailgun
// TODO: During migration to OSU servers, either get set up with university
// SMTP server or create one in node.js

let mailgun = require("mailgun-js"),
	API_KEY = process.env.MAILGUN_API_KEY,
	API_URL = "https://api:" + API_KEY + "@api.mailgun.net/v3/indaba-scheduler.herokuapp.com",
	mg = mailgun({apiKey: API_KEY, domain: API_URL});


// Send an invitation email with the specified info to all email addresses in the
// emails array using mailgun.
module.exports.sendInvitationEmail = function(organizerName, eventName, eventDescription, eventId, emails) {

	let from = "Indaba Scheduler <indaba-scheduler.herokuapp.com>";
	let recipientVariables = {}
	for (let email of emails) {
		recipientVariables[email] = {};
	}
	let subject = "Invitation to " + eventName;
	
	let text = "Hello!\n\n" + 
	organizerName + " has inivted you to the following event: " +
	eventName + "\n";
	if (eventDescription) {
		text += "Event description: " + eventDescription + "\n\n";
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

	mg.messages().send(data, function (error, body) {
		console.log(body);
	});	
};
