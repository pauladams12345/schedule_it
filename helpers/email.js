// Code for sending invitation emails using sendgrid
// TODO: During migration to OSU servers, either get set up with university
// SMTP server or create one in node.js

let sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send an invitation email with the specified info to all email addresses in the
// emails array using mailgun.
module.exports.sendInvitationEmail = function(organizerName, eventName, eventDescription, eventId, emails) {

	messageText = "Hello!\n\n" + 
	organizerName + " has inivted you to the following event: " +
	eventName + "\n\n";
	if (eventDescription) {
		messageText += "Event description: " + eventDescription + "\n\n";
	}
	messageText += "Click below to check out the event details and make your reservation\n\n" +
	"https://indaba-scheduler.herokuapp.com/make-reservations/" + eventId;

	let msg = {
		to: emails,
		from: {
			'name': 'Indaba Scheduler',
			'email': 'noreply@indaba-scheduler.herokuapp.com'
		},
		subject: 'Invitation to ' + eventName,
		text: messageText
	};

	sgMail.sendMultiple(msg);
};