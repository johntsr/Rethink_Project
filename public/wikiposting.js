function testFun(){
    // $('#hiddenP').text("DSKJGBKSDHBFDBVDSBHDSL");
}

function deletePost(id) {
    // $('#hiddenP').text("OKOKOKOO");
    hidePost(id);
    propagateDelete(id);
    fixListIndexes();
}

function hidePost(id){
    $('#' + id).remove();
}

function propagateDelete(id){
    $.ajax({
        type: 'DELETE',
        url: '/wikipost/delete/' + id
    });
}

function fixListIndexes(){
        $('#wikiposts li').each(function() {
            var i = $(this).index() + 1;
            $(this).find('.position').text( i );
    });
}

$(document).ready(function () {
    var socket = io();

    socket.on('wikipost', function(wikipost) {
	    $("#wikiposts").append("<li class='wikipost' id='" + wikipost.id + "'>" +
                "<span class='position'>" + ($( "li.wikipost" ).length+1) + "</span>" +
				"<span class='user'> " + wikipost.user + "</span>" +
                "<span class='title'> " + wikipost.title + " </span>" +
                "<input class='deletePost' type='image' src='delete.png' width='32' height='32' />" +
                "</li>");
	});

	socket.on('delete', function(movie) {
        hidePost(movie.id);
    });

    $('#wikiposts').on('click', '.deletePost', function (e) {
        var movieId = $(this).parent('li')[0].id;
        deletePost(movieId);
    });

    $('#form').on('submit', function (event) {
        event.preventDefault();
        var input = $('#title');
        var t = input.val();
        if(!t || t.trim().length === 0) {
            alert('The title is required');
            return false;
        } else {
            $.ajax({
                type: 'POST',
                url: '/wikipost',
                data: {
                    title: t
                },
                success: function(data) {
                    input.val('');
                }
            });
        }
    });
});
