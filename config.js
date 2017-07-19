module.exports = {
	database: {
		db: "LiveUpdatesDB",
		host: "localhost",
		port: 28015,
		user: "admin",
		password: ""
	},

	tables: {
		users: 'Users',
		broadcast: 'Broadcast',
		filters: 'Filters',
		sources: 'Sources'
	},

	emitDatabase: {
		db: "EmitDB",
		host: "localhost",
		port: 28016,
		user: "admin",
		password: ""
	},

	port: 3000
};
