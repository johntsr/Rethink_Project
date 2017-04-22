$('#dbTables').on('click', function (event) {
	event.preventDefault();

	if(prevSelected && prevSelected !== $('#dbTables').val()){
		$("#createFilters_" +  prevSelected).toggle("fast");
	}
	$("#createFilters_" +  $('#dbTables').val()).toggle("fast");

	prevSelected = $('#dbTables').val();
});

$('#filter_form').on('submit', function (event) {
	event.preventDefault();
	var sendData = new SendServerData();

	var title = $('#filter_title').val();
	if(!title || title.trim().length === 0) {
		sendData.triggerError('The title is required');
	}
	sendData.add("filterTitle", codeHtml(title));

	var table = $('#dbTables').val();
	sendData.add("table", table);

	for (var i = 0; i < fieldParsers[table].length; i++) {
		fieldParsers[table][i].pushData(sendData);
	}

	sendData.send('/profile/addfilter',
		function afterAddition(data){
			var success = JSON.parse(data).success;
			if( success){
				$('#filterResponse').text("Filter successfully added!");
			}
			else{
				$('#filterResponse').text("Filter wasn't added, it already exists!");
			}
			var milliseconds = 3000;
			setTimeout(function(){ $('#filterResponse').text(""); }, milliseconds);
		});
});

$('#currentFilters').on('click', '.deleteFilter', function (e) {
	var index = $(this).parent().index();
	deleteFilter(filterIDs[index]);
});

$('#currentFilters').on('click', '.pauseFilter', function (e) {
	var index = $(this).parent().index();
	pauseFilter(filterIDs[index]);
});

$('#currentFilters').on('click', '.playFilter', function (e) {
	var index = $(this).parent().index();
	playFilter(filterIDs[index]);
});

$('#filterstuff').hide();
$('#hideshowfilter').click(function(){
	$('#filterstuff').toggle("fast");
});
