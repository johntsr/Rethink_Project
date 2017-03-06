r.db('LiveUpdatesDB').table('Wiki').filter(
	function(doc){
	    return doc('title').match('(.png)|(.jpg)');
	}
);
