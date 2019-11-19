$.ajax({
  type: 'GET',
  url: '/get-past-reservations',
  success: function(resp) {
  	console.log(resp);
  },
  error: function() {

  }
});