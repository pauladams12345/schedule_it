module.exports = {
	setChecked: function (savedValue, currentValue) {
	    if ( savedValue == currentValue ) {
	       return "checked";
	    } else {
	       return "";
	    }
	}
}