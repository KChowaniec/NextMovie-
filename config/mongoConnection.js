/*Program Title: mongoConnection.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script configures the nextMovie database using the data provided in all-config.json
*/



var MongoClient = require("mongodb").MongoClient;
var config = require('../all-config.json');

var settings = {
    mongoConfig: {
        serverUrl: config.serverUrl,
        database: config.database
    }
};

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var _connection = undefined

var connectDb = () => {
    if (!_connection) {
        _connection = MongoClient.connect(fullMongoUrl)
            .then((db) => {
                return db;
            });
    }

    return _connection;
};


module.exports = connectDb;