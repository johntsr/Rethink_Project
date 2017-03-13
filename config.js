module.exports = {
  database: {
    db: process.env.RDB_DB || "LiveUpdatesDB",
    host: process.env.RDB_HOST || "localhost",
    port: process.env.RDB_PORT || 28015,
  	user: "admin",
  	password: "SKATEBOARD"
  },

  wiki: "Wiki",
  users: "Users",
  broadcast: 'Broadcast',

  port: process.env.APP_PORT || 3000
};
