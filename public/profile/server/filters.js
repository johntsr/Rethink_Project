function deleteFilter(filterID){
    $.ajax({
        type: 'DELETE',
        url: '/profile/filters/delete/',
        data: {
            id: filterID
        }
    });
}

function pauseFilter(filterID){
    $.ajax({
        type: 'POST',
        url: '/profile/filters/pause/',
        data: {
            id: filterID
        }
    });
}

function playFilter(filterID){
    $.ajax({
        type: 'POST',
        url: '/profile/filters/play/',
        data: {
            id: filterID
        }
    });
}
