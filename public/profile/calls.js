var FILTER_STATUS = {
  PLAY 		: 0,
  PAUSE		: 1,
  DELETE 	: 2
};


var calls = {};

calls.onNew = function(postInfo) {
    addPost(templates, postInfo.data, postInfo.filterTitle);
};

calls.onDelete = function(post) {
    hidePost(post.data.id);
};

calls.onUpdate = function(postInfo) {
    addPost(templates, postInfo.data, postInfo.filterTitle);
};

calls.newFilter = function(data) {
    addFilter(templates, data);
};

calls.deleteFilter = function(data) {
    hideFilter(data.id);
};

calls.statusFilter = function(data) {
	if( data.status ===  FILTER_STATUS.PLAY ){
		$('#' + data.id + " .playFilter").hide();
		$('#' + data.id + " .pauseFilter").show();
    }
    else{
		$('#' + data.id + " .playFilter").show();
		$('#' + data.id + " .pauseFilter").hide();
    }
};
