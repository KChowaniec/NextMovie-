var express = require('express');
var router = express.Router();
var data = require("../data");
var form = data.form;
var api = data.api;
var user = data.users;
var userId = " ";

router.get("/", (req, res) => {
    //check for user preferences (if any)
    user.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
        user.getUserPreferences(userObj._id).then((preferences) => {
            if (Object.keys(preferences).length > 0) { //preferences defined
                res.render("search/form", {
                    partial: "populate-preferences-script"
                });
            }
            else { //no preferences defined
                res.render("search/form", {
                    partial: "form-validation"
                });
            }
        });
    });
});

router.get("/preferences", (req, res) => {
    //get user preferences (if any)
    user.getUserBySessionId(req.cookies.next_movie).then((userObj) => {
        user.getUserPreferences(userObj._id).then((preferences) => {
            preferences.actor = 'Brad Pitt';
            if (Object.keys(preferences).length > 0) { //preferences defined
                res.json({ success: true, preferences: preferences });
            }
        }).catch((error) => {
            res.json({ success: false, error: error });
        });
    });
});


router.post("/", (req, res) => {
    var title = req.body.title;
    var actors = req.body.actors;
    var genres = req.body.genre;
    var crew = req.body.crew;
    var rating = req.body.rating;
    var evaluation = req.body.evaluation;
    var year = parseInt(req.body.releaseYear);
    var keywords = req.body.keywords;

    var parseActors = [];
    var parseWords = [];
    var parseGenre = [];
    var aIds = [];
    var kIds = [];

    if (genres) {
        if (typeof genres === "object") { //multiple genres selected
            for (var i = 0; i < genres.length; i++) {
                parseGenre.push(parseInt(genres[i]));
            }
        }
        else { //just one genre selected
            parseGenre.push(parseInt(genres));
        }
    }

    if (actors) {
        parseActors = actors.split(',');
        if (parseActors.length == 0) { //only one actor entered
            parseActors.push(actors);
        }

        var actorIds = form.getActorIds(parseActors);

    }

    if (crew) {
        var crewName = api.getPersonIdByName(crew);
        crewName.then((crewId) => {
            var personId = crewId.results[0].id;
        });
    }
    if (keywords) {
        parseWords = keywords.split(',');
        if (parseWords.length == 0) {
            parseWords.push(keywords);
        }
        // console.log(parseWords);
        var keywordIds = form.getKeywordIds(parseWords);
    }

    Promise.all([crewName, actorIds, keywordIds]).then(values => {
        var crewId;
        if (values[0]) {
            crewId = values[0].results[0].id;
        }
        //var actorIds = values[0].results[1];
        //console.log(actorIds);

        //SEARCH BY MOVIE TITLE
        if (title) {
            var result = api.searchByTitle(title);
            result.then((movies) => {
                var movielist = form.formatReleaseDate(movies.results);
                var total = movies.total_results;
                res.render("results/movielist", { movies: movielist, total: total, partial: "results-script" });
            }).catch((e) => {
                res.render("search/form", {
                    title: title, actors: actors, genres: genre, crew: crew,
                    evaluation: evalution, rating: rating, releaseYear: year, keywords: keywords, error: e, partial: "form-validation"
                });
            });
        }

        //SEARCH BY CRITERIA
        else {
            var criteria = api.createSearchString(aIds, parseGenre, crewId, rating, evaluation, year, kIds);
            var result = api.searchByCriteria(criteria);
            result.then((movies) => {
                var movielist = form.formatReleaseDate(movies.results);
                var total = movies.total_results;
                res.render("results/movielist", { movies: movielist, total: total, partial: "results-script" });
            }).catch((e) => {
                res.render("search/form", {
                    title: title, actors: actors, genres: genre, crew: crew,
                    evaluation: evalution, rating: rating, releaseYear: year, keywords: keywords, error: e, partial: "form-validation"
                });
            });
        }
    });
});

router.get("/results", (req, res) => { //call search methods using criteria passed in
    let queryData = url.parse(req.url, true).query;
    let queryString = "";
    Object.keys(queryData).forEach(function (key, index) {
        queryString = queryString + "&" + key + "=" + queryData[key];
    });

    let result = api.searchByCriteria(queryString);
    result.then((movies) => {
        let movielist = form.formatReleaseDate(movies.results);
        let total = movies.total_results;
        res.render("results/movielist", { movies: movielist, total: total, partial: "results-script" });
    }).catch((e) => {
        res.render("search/form", {
            title: title, actors: actors, genres: genre, crew: crew,
            evaluation: evalution, rating: rating, releaseYear: year, keywords: keywords, error: e, partial: "form-validation"
        });
    });

});

router.get("/keywords", (req, res) => {
    api.searchKeywordsByName(req.query.value).then((result) => {
        if (result){
            res.json({ success: true, results: result});
        } else {
            res.json({ success: false, message: "Keywords not found"});
        }
    }).catch((error) => {
        res.json({ success: false, message: error });
    });
});

router.get("/person", (req, res) => {
    
});

module.exports = router;