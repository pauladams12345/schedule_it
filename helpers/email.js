// Code for sending invitation emails using sendgrid
// TODO: During migration to OSU servers, either get set up with university
// SMTP server or create one in node.js

var helper = require('sendgrid').mail;

// Send an invitation email with the specified info to all email addresses in the
// emails array using mailgun.
module.exports.sendInvitationEmail = function(organizerName, eventName, eventDescription, eventId, emails) {

	messageText = "Hello!\n\n" + 
	organizerName + " has inivted you to the following event: " +
	eventName + "\n";
	if (eventDescription) {
		messageText += "Event description: " + eventDescription + "\n\n";
	}
	messageText += "Click below to check out the event details and make your reservation\n\n" +
	"https://indaba-scheduler.herokuapp.com/make-reservations/" + eventId;

	var fromEmail = new helper.Email({
		'name': 'Indaba Scheduler',
		'email': 'noreply@indaba-scheduler.herokuapp.com'
	});
	var toEmail = new helper.Email(emails);
	var subject = 'Invitation to ' + eventName;
	var content = new helper.Content('text/plain', messageText);
	var mail = new helper.Mail(fromEmail, subject, toEmail, content);

	var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
	var request = sg.emptyRequest({
	  method: 'POST',
	  path: '/v3/mail/send',
	  body: mail.toJSON(),
	});

	sg.API(request, function(error, response) {
	  console.log(response.statusCode);
	  console.log(response.body);
	  console.log(response.headers);
	});
};