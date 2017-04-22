function getPostsAsync(){
    $.ajax({
        type: 'GET',
        url: '/profile/getposts',
        success: function(data) {
            var posts = JSON.parse(data);
            for (var i = 0; i < posts.length; i++) {
                addPost(templates, posts[i]);
            }
        }
    });
}

function getFieldsInfoAsync(){
	$.ajax({
		type: 'GET',
		url: '/profile/fieldsInfo',
		success: function(data) {
			data = JSON.parse(data);
			ID = data.id;
			var tableInfo = data.tableInfo;

			socket.on('newFilter_' + ID, calls.newFilter);
			socket.on('deleteFilter_' + ID, calls.deleteFilter);
			socket.on('statusFilter_' + ID, calls.statusFilter);

			for (var tableName in tableInfo) {
				var fields = tableInfo[tableName];
				setupTablePanel(tableName, fields);
			}
		}
	});
}

function getFiltersAsync(originalTemplates, table){
    $.ajax({
        type: 'POST',
        url: '/profile/getfilters',
        data: {table: table},
        success: function(data) {
            var filterData = JSON.parse(data);
            for(var i = 0; i < filterData.length; i++){
                addFilter(originalTemplates, filterData[i]);
            }
        }
    });
}

function setupTablePanel(tableName, fields){
    socket.on('new' + tableName + '_' + ID, calls.onNew);
    socket.on('delete' + tableName + '_' + ID, calls.onDelete);
    socket.on('update' + tableName + '_' + ID, calls.onUpdate);

    getFiltersAsync(templates, tableName);
    setupFilterPanel(tableName);
    setupFilterParsers(tableName, fields);
}
