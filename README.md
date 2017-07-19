# Rethinkdb data filtering

This project aims to facilitate the use of Rethinkdb for real-time filtering of streaming data. This filtering mainly consists of defining a set of filters, applying them to streaming data and notifying the user for filter hits. A registered user of the system manages his filters and gets server notifications every time streaming data match his criteria. The filters consist of logical operators applied to boolean expressions, that ultimately filter a document based on its fields (up to now: boolean, numerical, enum and string fields are supported).
The project consists of a node-js server [Express](https://expressjs.com/) that serves user requests and two Rethinkdb servers: one that acts both as a traditional data base server (the one the web server communicates with and performs the dta filtering) and one publicly accessible over the web, where third party software may listen for notifications. Moreover, a web interface is available where the user may manage his account and view server notifications (based on [socket.io](https://socket.io/). Finally, two node-js scripts are provided: a setup script (it creates the appropriate tables) and a listener script (that listens to [wikipedia streaming api](https://wikitech.wikimedia.org/wiki/EventStreams) and posts data to the node-js server).
The project is developed and tested under Ubuntu 14.04 and 16.04.

## Installation and Deployment
- First, follow the rethinkdb installation instructions.
- Next, install the npm dependencies: `npm install`
- Next, initiate the Rethinkdb servers: `rethinkdb` and `rethinkdb --port-offset 1  --directory rethinkdb_data2`. For a different set of configurations, check the Rethinkdb official guide and change the config.js file accordingly.
- Next, run the setup script: `node setup.js`
- Finally, run the app server: `node app.js`

## Usage
The setup script creates a user account (username: 'test-user', password: 'test-user'), whose credentials are pre-populated in the web interface. From there, the user can manage his filters and listen to server notifications. Managemnet of filters includes creation, deletion and activation/deactivation (when deactivated, a filter no longer produces notifications).
By running the listener script (`node listen_wiki.js`), data are fed to the app server, triggering any filtering that the users have defined.
A third-party application may listen to the public rethinkdb server for notifications via any of the [Rethinkdb drivers](https://www.rethinkdb.com/docs/install-drivers/).
