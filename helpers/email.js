// Code for sending invitation emails using sendgrid
// TODO: During migration to OSU servers, either get set up with university
// SMTP server or create one in node.js

var helper = require('sendgrid').mail;
var from_email = new helper.Email('noreply@indaba-scheduler.herokuapp.com');
var to_email = new helper.Email('adamspa@oregonstate.edu');
var subject = 'Hello World from the SendGrid Node.js Library!';
var content = new helper.Content('text/plain', 'Hello, Email!');
var mail = new helper.Mail(from_email, subject, to_email, content);

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON(),
});


// Send an invitation email with the specified info to all email addresses in the
// emails array using mailgun.
module.exports.sendInvitationEmail = function(organizerName, eventName, eventDescription, eventId, emails) {


	sg.API(request, function(error, response) {
	  console.log(response.statusCode);
	  console.log(response.body);
	  console.log(response.headers);
	});




	// let from = "Indaba Scheduler <noreply@indaba-scheduler.herokuapp.com>";
	// let recipientVariables = {}
	// for (let email of emails) {
	// 	recipientVariables[email] = {};
	// }
	// let subject = "Invitation to " + eventName;
	
	// let text = "Hello!\n\n" + 
	// organizerName + " has inivted you to the following event: " +
	// eventName + "\n";
	// if (eventDescription) {
	// 	text += "Event description: " + eventDescription + "\n\n";
	// }
	// text += "Click below to check out the event details and make your reservation\n\n" +
	// "https://indaba-scheduler.herokuapp.com/make-reservations/" + eventId;

	// const data = {
	// 	"from": from,
	// 	"to": emails,
	// 	"recipient-variables": recipientVariables,
	// 	"subject": subject,
	// 	"text": text
	// };

	// mg.messages().send(data, function (error, body) {
	// 	console.log(body);
	// });	
};