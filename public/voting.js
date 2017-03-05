function testFun(){
    // $('#hiddenP').text("DSKJGBKSDHBFDBVDSBHDSL");
}

function deleteMovie(id) {
    // $('#hiddenP').text("OKOKOKOO");
    hideMovie(id);
    $.ajax({
        type: 'DELETE',
        url: '/movie/delete/' + id
    });
}

function hideMovie(id){
    $('#' + id).remove();
}

$(document).ready(function () {
    var socket = io();

    socket.on('updates', function(movie) {
        $('#' + movie.id + ' .likes').text(movie.likes);
        $('#' + movie.id + ' .unlikes').text(movie.unlikes);
    });
    socket.on('movies', function(movie) {
	    $(".movies").append("<li class='movie' id='" + movie.id + "'>" +
                "<span class='position'>" + ($( "li.movie" ).length+1) + "</span>" +
                "<div class='vote'>" +
                    "<div class='btnVote'>" +
                        "<span class='btnLike'><i class='fa fa-thumbs-up fa-2x'></i></span>" +
                        "<span class='numVotes likes'>" + movie.likes + "</span>" +
                    "</div>" +
                    "<div class='btnVote'>" +
                        "<span class='btnUnlike'><i class='fa fa-thumbs-down fa-2x'></i></span>" +
                        "<span class='numVotes unlikes'>" + movie.unlikes + "</span>" +
                    "</div>" +
                "</div>" +
                "<span class='title'> " + movie.title + " </span>" +
                "<input class='delImage' type='image' src='delete.png' width='32' height='32' />" +
                "</li>");
	});

	socket.on('delete', function(movie) {
        hideMovie(movie.id);
    });

    $('.movies').on('click', 'span.btnLike', function (e) {
        var movieId = $(this).parent('div').parent('div').parent('li')[0].id;
        $.ajax({
            type: 'PUT',
            url: '/movie/like/' + movieId
        });
    });

    $('.movies').on('click', 'span.btnUnlike', function (e) {
        var movieId = $(this).parent('div').parent('div').parent('li')[0].id;
        $.ajax({
            type: 'PUT',
            url: '/movie/unlike/' + movieId
        });
    });

    $('.movies').on('click', '.delImage', function (e) {
        var movieId = $(this).parent('li')[0].id;
        deleteMovie(movieId);
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
                url: '/movie',
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
