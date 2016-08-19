/*Program Title: data/api.js
Course: CS546-WS
Date: 08/18/2016
Description:
This module exports methods related to the movie api
*/


var https = require("https");
var pathTail = "?api_key=4b9df4187f2ee368c196c4a4247fc1aa";
var imgHost = "https://image.tmdb.org/t/p/w300_and_h450_bestv2";
var restHost = "https://api.themoviedb.org/3";
var uuid = require("node-uuid");

// //build search string using entered criteria
var exportedMethods = {

    //get movie details
    getMovieDetails(movieId) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + movieId + pathTail + "&append_to_response=keywords,images,credits,release_dates", function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    reject(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    var movie = {};
                    movie._id = uuid.v4();//save the origin id and our own id
                    movie.id = movieId;
                    movie.title = parsed.title;
                    movie.description = parsed.overview;
                    var date = new Date(parsed.release_date);
                    var formatDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
                    movie.releaseDate = formatDate;
                    movie.averageRating = parsed.vote_average;
                    movie.poster_path = parsed.poster_path;

                    var keywordVal = [];
                    for (var i = 0; i < parsed.keywords.keywords.length; i++) {
                        keywordVal.push(parsed.keywords.keywords[i].name);
                    }
                    movie.keywords = keywordVal;

                    var genreVal = [];
                    for (var i = 0; i < parsed.genres.length; i++) {
                        genreVal.push(parsed.genres[i].name);
                    }
                    movie.genre = genreVal;
                    movie.runtime = parsed.runtime;

                    var castVal = [];
                    for (var i = 0; i < parsed.credits.cast.length; i++) {
                        castVal.push(parsed.credits.cast[i].name);
                    }
                    movie.cast = castVal;

                    var director = "";
                    var crewVal = [];
                    for (var i = 0; i < parsed.credits.crew.length; i++) {
                        if (parsed.credits.crew[i].job == "Director") {
                            director = parsed.credits.crew[i].name;
                        }
                        crewVal.push(parsed.credits.crew[i].name);
                    }
                    movie.crew = crewVal;
                    movie.director = director;

                    var rating = "";
                    for (var i = 0; i < parsed.release_dates.results.length; i++) {
                        if (parsed.release_dates.results[i].iso_3166_1 == "US") {
                            rating = parsed.release_dates.results[i].release_dates[0].certification;
                        }
                    }
                    movie.rated = rating;

                    fulfill(movie);
                });
            });
        });
    },

    //get specific page of reults
    getPageOfResults(pageNum, url) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + url + "&page=" + pageNum, function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    reject(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    fulfill(parsed);
                });
            });
        });
    },

    //get api movie reviews
    getMovieReviews(movieId) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + movieId + "/reviews" + pathTail, function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    reject(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    fulfill(parsed);
                });
            });
        });
    },

    //get specific movie credits
    getMovieCredits(movieId) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/movie/" + movieId + "/credits" + pathTail, function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    reject(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    fulfill(parsed);
                });
            });
        });
    },

    //get person's id from their name
    getPersonIdByName(personName) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/search/person" + pathTail + "&query=" + personName + "&include_adult=false", function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    callback(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    fulfill(parsed);
                });
            });
        });
    },

    //get keyword if from its name
    getKeywordIdByName(keyword) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/search/keyword" + pathTail + "&query=" + keyword, function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    reject(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    fulfill(parsed);
                });
            });
        });
    },

    //search movies by title
    searchByTitle(title, page) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/search/movie" + pathTail + "&query=" + title + "&include_adult=false&page=" + page, function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    reject(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    fulfill(parsed);
                });
            });
        });
    },

    //search movies by criteria
    searchByCriteria(searchString, page) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/discover/movie" + pathTail + searchString + "&page=" + page, function (response) {
                response.setEncoding('utf8');
                var body = '';
                response.on('data', function (d) {
                    body += d;
                });
                response.on('error', (e) => {
                    reject(e);
                });
                response.on('end', function () {
                    var parsed = JSON.parse(body);
                    fulfill(parsed);
                });
            });
        });
    },
    //search keywords by name
    searchKeywordsByName(name) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/search/keyword" + pathTail + "&query=" + name, function (res) {
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });

                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    var keywordArr = [];
                    for (var i = 0; i < 10; i++) {
                        keywordArr.push(rs[i]);
                    }

                    fulfill(keywordArr);
                });
            });
        });
    },
    //search person by name
    searchPersonByName(name) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/search/person" + pathTail + "&query=" + name, function (res) {
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });

                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    var persons = [];
                    var cnt = 10;
                    if (rs.length < cnt) cnt = rs.length;
                    for (var i = 0; i < cnt; i++) {
                        var person = {
                            id: rs[i].id,
                            name: rs[i].name,
                        };
                        persons.push(person);
                    }

                    fulfill(persons);
                });
            });
        });
    },

    //get credits for person
    getCreditByPersonId(id) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/person/" + id + pathTail + "&append_to_response=movie_credits", function (res) {
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });

                res.on('end', () => {
                    var rs = JSON.parse(_data);
                    fulfill(rs);
                });
            });
        });
    }
}

module.exports = exportedMethods; //export methods