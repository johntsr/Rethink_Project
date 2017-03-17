function codeHtml(str){
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


$(document).ready(function () {
	$('#form_signin').on('submit', function (event) {
        event.preventDefault();

        var _username = $('#username_signin').val();
		if(!_username || _username.trim().length === 0) {
            alert('The username is required');
			return;
        }

		var _password = $('#password_signin').val();
		if(!_password || _password.trim().length === 0) {
            alert('The password is required');
			return;
        }

		var password_again = $('#password_signin_again').val();
		if(!password_again || password_again.trim().length === 0) {
            alert('The verify password is required');
			return;
        }

		if(_password !== password_again){
			alert('The passwords must match!');
			return;
		}

		$.ajax({
	        type: 'POST',
	        url: '/signin',
	        data: {username: codeHtml(_username), password: codeHtml(_password)},
	        success: function(data) {
	            var success = JSON.parse(data).success;
				if( success){
                    $('#signinResponse').text("Successfully signed in!");
                }
                else{
                    $('#signinResponse').text("Could not sign in, please enter another username/password.");
                }
                var milliseconds = 3000;
                setTimeout(function(){ $('#signinResponse').text(""); }, milliseconds);
	        }
	    });
    });
});
