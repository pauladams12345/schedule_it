module.exports = {
	extractAttributes: function(err, res, body) {
		//TODO: add error handling
		// Parse successful request
		if (err) {
			next(err)		// pass errors to Express
		}
		else {
			try {

				// Convert XML response to JSON, extract attributes
				let json = JSON.parse(parser.toJson(body));
				console.log(JSON.stringify(json));
				json = json['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
				let attributes = {};
				attributes['onid'] = json['cas:uid'];
				attributes['firstName'] = json['cas:firstname'];
				attributes['lastName'] = json['cas:lastname'];
				attributes['fullName'] = json['cas:fullname'];
				attributes['email'] = json['cas:email'];

				console.log("onid: " + attributes['onid']);
				console.log("firstName: " + attributes['firstName']);
				console.log("lastName: " + attributes['lastName']);
				console.log("fullName: " + attributes['fullName']);
				console.log("email: " + attributes['email']);

				return attributes;
			}
			catch(err) {
				next(err);
			}
		}
	};
};