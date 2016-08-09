/*Program Title: data/index.js
Author: Kathy Chowaniec
Course: CS546-WS
Date: 07/20/2016
Description:
This module exports the form methods 
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