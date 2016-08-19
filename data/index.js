/*Program Title: data/index.js
Course: CS546-WS
Date: 08/18/2016
Description:
This module exports the data modules
*/
var form = require("./form");
var users = require("./users");
var playlist = require("./playlist");
var movie = require("./movie");
var api = require("./api");

module.exports = {
    form: form,
    api: api,
    movie: movie,
    playlist: playlist,
    users: users
};