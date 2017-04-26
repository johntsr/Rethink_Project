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
		alert('The title is required');
		return;
	}
	sendData.add("filterTitle", codeHtml(title));

	var table = $('#dbTables').val();
	if( !table ){
		alert('A table is required');
		return;
	}
	sendData.add("table", table);

	for (var i = 0; i < fieldParsers[table].length; i++) {
		fieldParsers[table][i].pushData(sendData);
	}

	var frequency_count = $('#frequency_count').val();
	var frequency_time = $('#frequency_time').val();
	if( !frequency_count || frequency_count < 1 || !frequency_time){
		frequency_count = 2;
		frequency_time = "m30";
	}

	sendData.add("frequency", { count: frequency_count, time: frequency_time });

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
