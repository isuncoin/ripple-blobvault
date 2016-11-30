var config = require('../config');
var Knex = require('knex');
var knex = Knex({
    client: 'postgres',
    connection : config.database.postgres
});
var migrate = require('./migrate.js');
exports.migrate = migrate;
exports.connection = knex;
