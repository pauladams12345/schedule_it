// Handlebars helper functions

module.exports = {
	// If the supplied args match, return "checked".
	// Used for setting checkboxes/radio buttons to match stored values
	setChecked: function (savedValue, currentValue) {
	    if ( savedValue == currentValue ) {
	       return "checked";
	    } else {
	       return "";
	    }
	}
};