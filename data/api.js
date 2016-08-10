var https = require("https");
var pathTail = "?api_key=4b9df4187f2ee368c196c4a4247fc1aa";
var imgHost = "https://image.tmdb.org/t/p/w300_and_h450_bestv2";
var restHost = "https://api.themoviedb.org/3";

var exportedMethods = {
    createSearchString(actors, genre, crew, rating, evaluation, year, keywords) {
        var query = "";
        if (rating) query = query + "&certification_country=US";
        if (evaluation === "equal") query = query + "&certification=" + rating;
        else if (evaluation === "lte") query = query + "&certification.lte=" + rating;
        if (year) query = query + "&primary_release_year=" + year;
        if (genre.length > 0) query = query + "&with_genres=" + genre.join('|');
        if (keywords.length > 0) query = query + "&with_keywords=" + keywords.join('|');
        if (actors.length > 0) query = query + "&with_cast=" + actors.join('|');
        if (crew) query = query + "&with_crew=" + crew;

        query = query + "&sort_by=vote_average.desc"; //sort results by movies with highest rating
        return query;
    },
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
                    movie._id = movieId;
                    movie.title = parsed.title;
                    movie.description = parsed.overview;
                    var date = new Date(parsed.release_date);
                    var formatDate = (date.getMonth() + 1) + "/" + date.getDay() + "/" + date.getFullYear();
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
                    for (var i = 0; i < parsed.credits.crew.length; i++) {
                        if (parsed.credits.crew[i].job == "Director") {
                            director = parsed.credits.crew[i].name;
                        }
                    }
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
    searchByTitle(title) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/search/movie" + pathTail + "&query=" + title + "&include_adult=false", function (response) {
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
    searchByCriteria(searchString) {
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/discover/movie" + pathTail + searchString, function (response) {
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
    
    searchKeywordsByName(name){
        return new Promise((fulfill, reject) => {
            https.get(restHost + "/search/keyword" + pathTail + "&query=" + name, function (res) {
                var _data = '';
                res.on('data', (d) => {
                    _data += d;
                });
                
                res.on('end', () => {
                    var rs = JSON.parse(_data).results;
                    var keywordArr = [];
                    for (var i = 0; i < 10; i++){
                        keywordArr.push(rs[i]);
                    }
                    
                    fulfill(keywordArr);
                });
            });
        });
    }
    
}

module.exports = exportedMethods; //export methods