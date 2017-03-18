function deletePost(id) {
    $.ajax({
        type: 'DELETE',
        url: '/profile/wikipost/delete/' + id
    });
}

$('#wikiposts').on('click', '.deletePost', function (e) {
    var postID = $(this).parent('li')[0].id;
    deletePost(postID);
});

$('#wikipost_form').on('submit', function (event) {
    event.preventDefault();
    var sendData = new SendServerData();

    var title = $('#wiki_post_title').val();
    if(!title || title.trim().length === 0) {
        sendData.triggerError('The title is required');
    }
    sendData.add("title", codeHtml(title));
    sendData.send('/profile/addwikipost');
});
