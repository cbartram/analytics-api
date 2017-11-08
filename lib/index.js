'use strict';

var request = require('superagent');

var host = 'http://localhost:3010';
var queryObj = {};

//Private
function setQuery() {
    if (typeof queryObj.query === 'undefined') {
        queryObj.query = {};
    }
}

module.exports = {

    /**
     * Registers a new pick predictions widget
     * which will Query the database for the information specified
     * @param config Object configuration object see docs for detailed specifications
     * @param callback Function callback function
     */
    registerPickPredictor: function registerPickPredictor(config, callback) {
        request.post(host + '/form/register').send(config).set('accept', 'json').end(function (err, res) {
            typeof res !== 'undefined' ? callback(res.body) : callback(err);
        });
    },


    /**
     * Opens up the fluent query API and initializes the query to the specified namespace
     * @returns {module.exports.query}
     */
    query: function query() {
        queryObj = {};
        return this;
    },


    /**
     * Sets the Database (Namespace) to query on
     * @param namespace String namespace i.e Pizza.createForm or User.memberSearch
     * @returns {module.exports.database}
     */
    database: function database(namespace) {
        setQuery();
        queryObj.namespace = namespace;
        return this;
    },


    /**
     * Constrains result set to documents where inside the given table
     * @param name String table Name
     * @returns {module.exports.table}
     */
    table: function table(name) {
        queryObj.table = name;
        return this;
    },


    /**
     * Constrains result set to documents where the value is equal to the specified param
     * @param value String value to compare
     * @returns {module.exports.where}
     */
    where: function where(value) {
        queryObj.query = {
            where: value
        };

        return this;
    },


    /**
     *
     * @param array
     * @returns {module.exports.and}
     */
    and: function and(array) {
        //Error Checking
        setQuery();
        queryObj.query.and = array;
        return this;
    },


    /**
     * Constrain results where references array can have either values in the array
     * @param array Array values which logical OR in references
     * @returns {module.exports.or}
     */
    or: function or(array) {
        setQuery();
        queryObj.query.or = array;
        return this;
    },


    /**
     * Constrain result set to values which have a matching regex to param
     * @param value String value to match
     * @returns {module.exports.like}
     */
    like: function like(value) {
        setQuery();
        queryObj.query.like = value;
        return this;
    },


    /**
     * Constrain result set to only that where the user ID matches
     * @param id String user ID
     * @returns {module.exports.onlyUser}
     */
    onlyUser: function onlyUser(id) {
        setQuery();
        queryObj.query.user = id;
        return this;
    },


    /**
     * Executes the Query on the Database and returns the result set
     * @param callback function Callback function to retrieve results
     */
    exec: function exec(callback) {
        request.post(host + '/query').send(queryObj).set('accept', 'json').end(function (err, res) {
            queryObj = {}; //Clear QueryObj
            typeof res !== 'undefined' ? callback(res.body) : callback(err);
        });
    },
    analyze: function analyze(config, callback) {
        request.post(host + '/analytics').send(config).set('accept', 'json').end(function (err, res) {
            typeof res !== 'undefined' ? callback(res.body) : callback(err);
        });
    },
    limit: function limit(amount) {
        setQuery();
        queryObj.query.limit = amount;
        return this;
    },


    /**
     * Finds All Documents
     * @param callback
     */
    all: function all(callback) {
        request.get(host + '/all').end(function (err, res) {
            typeof res !== 'undefined' ? callback(res.body) : callback(err);
        });
        request.get(host + '/all').on('response', function (err, res, body) {
            callback(body);
        });
    },


    /**
     * Inserts data into the database under a specified namespace
     * @param config Configuration Object see the docs for detailed specification
     */
    insert: function insert(config) {
        request.post(host + '/insert').send(config).set('accept', 'json').end();
        return this;
    },


    /**
     * Sets the Host where the server is running
     * @param hosty String hostname
     */
    setHost: function setHost(hosty) {
        host = hosty;
    },


    /**
     * Returns the active Query Object
     * @returns {{}}
     */
    getQuery: function getQuery() {
        return queryObj;
    },


    /**
     * Returns the currently set Host
     * http://localhost:3010 is the default value
     * @returns {string}
     */
    getHost: function getHost() {
        return host;
    }
};